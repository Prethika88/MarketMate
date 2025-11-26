import Order from "../models/order.model.js"
import Product from "../models/product.model.js"
import User from "../models/user.model.js"
import stripe from "stripe"

export const createOrderCOD = async (req, res) => {
    try {
        const { items, address } = req.body
        const userId = req.user.id

        if (!address || items.length === 0) {
            return res.status(400).json({ success: false, message: "inavalid data" })
        }

        let amount = await items.reduce(async (acc, item) => {
            const product = await Product.findById(item.product)
            return (await acc) + product.offerPrice * item.quantity
        }, 0)

        amount += Math.floor(amount * 0.02)

        await Order.create({
            userId,
            items,
            amount,
            address,
            paymentType: "COD"
        })
        await User.findByIdAndUpdate(userId, { cartItems: {} })

        return res.status(201).json({ success: true, message: "Order created sucessfully" })

    } catch (error) {
        console.error("Order error:", error.message)
        res.status(500).json({ success: false, message: "Something went wrong" })
    }
}

export const createStripeOrder = async (req, res) => {
    try {
        const userId = req.user.id
        const { items, address } = req.body
        const { origin } = req.headers

        if (!address || items.length === 0) {
            return res.status(400).json({ success: false, message: "invalid data" })
        }

        let productData = []

        let amount = await items.reduce(async (acc, item) => {
            const product = await Product.findById(item.product)
            productData.push({
                name: product.name,
                price: product.offerPrice,
                quantity: item.quantity
            })
            return (await acc) + product.offerPrice * item.quantity
        }, 0)

        amount += Math.floor(amount * 0.02)
        const order = await Order.create({
            userId,
            items,
            amount,
            address,
            paymentType: "Online"
        })

        const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY)

        const line_items = productData.map((item) => {
            return {
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: item.name,
                    },
                    unit_amount: Math.floor(item.price + item.price * 0.02) * 100
                },
                quantity: item.quantity
            }
        })

        const session = await stripeInstance.checkout.sessions.create({
            line_items,
            mode: "payment",
            success_url: `${origin}/loader?next=orders&payment=success`,
            cancel_url: `${origin}/cart`,
            metadata: {
                orderId: order._id.toString(),
                userId,
            }
        })
        
        return res.status(201).json({ success: true, url: session.url })
    } catch (error) {
        console.error("Order error:", error.message)
        return  res.status(500).json({ success: false, message: "Something went wrong" })
    }
}

export const stripeWebhooks = async (req, res) => {
    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY)

    const signature = req.headers["stripe-signature"]
    let event

    try {
        event = stripeInstance.webhooks.constructEvent(
            req.body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        )
    } catch (error) {
        res.status(500).send(`Webhooh error: ${error.message}`)
    }

    switch (event.type) {
        case "payment_intent.succeeded": {
            const payment_intent = event.data.object
            const payment_intent_id = payment_intent.id

            const session = await stripeInstance.checkout.sessions.list({
                payment_intent: payment_intent_id,
            })

            const { orderId, userId } = session.data[0].metadata
            console.log("Atualizando carrinho do usuário:", userId);
            await Order.findByIdAndUpdate(orderId, { isPaid: true })

            await User.findByIdAndUpdate(userId, { cartItems: {} })
            break;
        }
        case "payment_intent.payment_failed": {
            const payment_intent = event.data.object
            const payment_intent_id = payment_intent.id

            const session = await stripeInstance.checkout.sessions.list({
                payment_intent: payment_intent_id,
            })

            const { orderId } = session.data[0].metadata

            await Order.findByIdAndDelete(orderId)

            break;
        }



        default:
            console.error(`Unhandled event type ${event.type}`)
            break;
    }

    res.status(200).json({ received: true })
}


export const getUserOrders = async (req, res) => {
    try {
        const userId = req.user.id
        const orders = await Order.find({
            userId,
            $or: [{ paymentType: "COD" }, { isPaid: true }]
        }).populate("items.product address").sort({ createdAt: -1 })

        return res.status(200).json({ success: true, orders })

    } catch (error) {
        console.error("Order error:", error.message)
        res.status(500).json({ success: false, message: "Something went wrong" })
    }
}


export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate("userId", "name email")
            .populate("items.product address")
            .sort({ createdAt: -1 })

        res.status(200).json({ success: true, orders })
    } catch (error) {
        console.error("Order error:", error.message)
        res.status(500).json({ success: false, message: "Something went wrong" })
    }
}