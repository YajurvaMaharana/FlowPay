const fs = require('fs');

let code = fs.readFileSync('src/services/buyerBot.ts', 'utf8');

code = code.replace(
  `    const negotiatedPrice = cartCalculation.subtotal - cartCalculation.discountAmount;

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

    if (text.includes("concession") || text.includes("discount") || text.includes("new total")) {
        if (negotiatedPrice > 8500) {
            return \`That brings the price to ₹\${negotiatedPrice.toLocaleString('en-IN')} before tax, which is still above my authorized budget of ₹8,500. Can you offer a better discount?\`;
        }
    }`,
  `    const negotiatedPrice = cartCalculation.subtotal - cartCalculation.discountAmount;

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
            return \`That brings the price to ₹\${negotiatedPrice.toLocaleString('en-IN')} before tax, which is still above my authorized budget of ₹8,500. Can you offer a final adjustment?\`;
        }
    }`
);

fs.writeFileSync('src/services/buyerBot.ts', code);
