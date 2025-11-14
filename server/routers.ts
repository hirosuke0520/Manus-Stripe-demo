import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { createCheckoutSession } from "./stripe";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  menu: router({
    getCategories: publicProcedure.query(async () => {
      return await db.getAllCategories();
    }),
    
    getAllItems: publicProcedure.query(async () => {
      return await db.getAvailableMenuItems();
    }),
    
    getItemsByCategory: publicProcedure
      .input(z.object({ categoryId: z.number() }))
      .query(async ({ input }) => {
        return await db.getMenuItemsByCategory(input.categoryId);
      }),
  }),

  staff: router({
    getAllOrders: protectedProcedure.query(async () => {
      return await db.getAllOrders();
    }),
    
    getOrdersByStatus: protectedProcedure
      .input(z.object({ status: z.string() }))
      .query(async ({ input }) => {
        return await db.getOrdersByStatus(input.status);
      }),
    
    updateOrderStatus: protectedProcedure
      .input(z.object({
        orderId: z.number(),
        status: z.enum(['pending', 'paid', 'preparing', 'served', 'completed', 'cancelled']),
      }))
      .mutation(async ({ input }) => {
        await db.updateOrderStatus(input.orderId, input.status);
        return { success: true };
      }),
    
    getDailySales: protectedProcedure
      .input(z.object({ date: z.date() }))
      .query(async ({ input }) => {
        return await db.getDailySales(input.date);
      }),
    
    getMonthlySales: protectedProcedure
      .input(z.object({ year: z.number(), month: z.number() }))
      .query(async ({ input }) => {
        return await db.getMonthlySales(input.year, input.month);
      }),
    
    getOrderDetails: protectedProcedure
      .input(z.object({ orderId: z.number() }))
      .query(async ({ input }) => {
        const order = await db.getOrderById(input.orderId);
        if (!order) {
          throw new Error('Order not found');
        }
        const items = await db.getOrderItemsByOrderId(input.orderId);
        return { order, items };
      }),
  }),

  order: router({
    create: publicProcedure
      .input(z.object({
        tableNumber: z.string(),
        items: z.array(z.object({
          menuItemId: z.number(),
          quantity: z.number().min(1),
        })),
        customerName: z.string().optional(),
        customerEmail: z.union([z.string().email(), z.literal('')]).optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        // Get menu items to calculate total
        const menuItemIds = input.items.map(item => item.menuItemId);
        const allMenuItems = await db.getAllMenuItems();
        const selectedItems = allMenuItems.filter(item => menuItemIds.includes(item.id));
        
        // Calculate total
        let totalAmountYen = 0;
        const orderItemsData = input.items.map(item => {
          const menuItem = selectedItems.find(mi => mi.id === item.menuItemId);
          if (!menuItem) {
            throw new Error(`Menu item ${item.menuItemId} not found`);
          }
          totalAmountYen += menuItem.priceYen * item.quantity;
          return {
            menuItemId: item.menuItemId,
            menuItemName: menuItem.name,
            quantity: item.quantity,
            priceYen: menuItem.priceYen,
          };
        });
        
        // Create order
        const orderId = await db.createOrder({
          tableNumber: input.tableNumber,
          totalAmountYen,
          status: 'pending',
          customerName: input.customerName,
          customerEmail: input.customerEmail,
          notes: input.notes,
        });
        
        // Create order items
        for (const orderItem of orderItemsData) {
          await db.createOrderItem({
            orderId: Number(orderId),
            ...orderItem,
          });
        }
        
        // Create Stripe checkout session
        const origin = ctx.req.headers.origin || 'http://localhost:3000';
        const checkoutSession = await createCheckoutSession({
          orderId: Number(orderId),
          tableNumber: input.tableNumber,
          totalAmountYen,
          customerEmail: input.customerEmail,
          customerName: input.customerName,
          origin,
        });
        
        // Save Stripe session ID to order
        await db.updateOrderStripeInfo(Number(orderId), checkoutSession.id);
        
        return {
          orderId: Number(orderId),
          totalAmountYen,
          checkoutUrl: checkoutSession.url,
        };
      }),
    
    getById: publicProcedure
      .input(z.object({ orderId: z.number() }))
      .query(async ({ input }) => {
        const order = await db.getOrderById(input.orderId);
        if (!order) {
          throw new Error('Order not found');
        }
        const items = await db.getOrderItemsByOrderId(input.orderId);
        return { order, items };
      }),
  }),
});

export type AppRouter = typeof appRouter;
