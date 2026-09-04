const fs = require('fs');

let code = fs.readFileSync('src/components/MessageItem.tsx', 'utf8');

code = code.replace(
  `export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  onQuickReplyClick,
  onGatedActionConfirm,
  onOpenProductDetail,
  onAddToCart,
  onOpenPaymentModal,
  onSimulateFailure,
  onOpenInvoice
}) => {
  const isUser = message.sender === 'user';`,
  `export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  onQuickReplyClick,
  onGatedActionConfirm,
  onOpenProductDetail,
  onAddToCart,
  onOpenPaymentModal,
  onSimulateFailure,
  onOpenInvoice
}) => {
  if (!message.content?.trim() && !message.toolCalls?.length && !message.gatedAction) {
    return null;
  }

  const isUser = message.sender === 'user';`
);

fs.writeFileSync('src/components/MessageItem.tsx', code);
