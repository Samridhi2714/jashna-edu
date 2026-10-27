export const WHATSAPP_NUMBER = "919953009947"; 

const DEFAULT_MESSAGE =
  "Hello Dr.Shivam Sir, I would like to book a free consultation for the English communication program at Jashna Edu.";

export const getWhatsAppLink = (message = DEFAULT_MESSAGE) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;