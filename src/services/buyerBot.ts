import { Message, CartCalculation } from '../types';

export function simulateBuyerBot(messages: Message[], cartCalculation: CartCalculation): string | null {
    if (messages.length === 0) return null;
    
    // Check if we've already reached a terminal state in the history
    const hasTerminated = messages.some(m => m.sender === 'user' && m.content.includes("decline the offer and terminate"));
    const hasAccepted = messages.some(m => m.sender === 'user' && m.content.includes("I accept the price, proceed to checkout."));
    
    if (hasTerminated || hasAccepted) {
        return null; // Stop looping if a terminal state was reached
    }

    const merchantResponse = messages[messages.length - 1];
    if (merchantResponse.sender !== 'agent') return null;

    const text = merchantResponse.content.toLowerCase();
    
    // Negotiate on the subtotal (price of items before tax)
    const negotiatedPrice = cartCalculation.subtotal - cartCalculation.discountAmount;

    // Check if the price is within budget
    if (negotiatedPrice > 0 && negotiatedPrice <= 8500) {
        return "I accept the price, proceed to checkout.";
    }

    // If the merchant hits their maximum concession and it's still above budget, we terminate
    if (text.includes("absolute best price") || text.includes("strictly cap") || text.includes("maximum authorized")) {
        return "Since that is your absolute best price and it still exceeds my hard budget of ₹8,500, I must decline the offer and terminate this negotiation. Thank you for your time.";
    }

    // Negotiation logic
    if (text.includes("too low") || text.includes("cannot go lower")) {
        return "My client has a strict budget of ₹8,500 for the AeroType Carbon. If you can meet that, we have a deal right now.";
    }

    if (text.includes("concession") || text.includes("discount") || text.includes("new total") || text.includes("code:")) {
        if (negotiatedPrice > 8500) {
            return `That brings the price to ₹${negotiatedPrice.toLocaleString('en-IN')} before tax, which is still above my authorized budget of ₹8,500. Can you offer a final adjustment?`;
        }
    }

    // Check if we already sent the initial kick-off to avoid spamming it
    const hasSentInitial = messages.some(m => m.sender === 'user' && m.content.includes("currently listed at ₹8,999"));
    if (hasSentInitial) {
        const lastUserMessage = messages.slice().reverse().find(m => m.sender === 'user');
        if (lastUserMessage && lastUserMessage.content.includes("currently listed at ₹8,999")) {
             return "Please offer your best price for the AeroType Carbon. My client has a budget of ₹8,500.";
        }
    }

    // Initial negotiation kick-off or push-back
    return "The AeroType Carbon is currently listed at ₹8,999. My client's budget is strictly ₹8,500. Please lower the price so we can finalize the purchase.";
}
