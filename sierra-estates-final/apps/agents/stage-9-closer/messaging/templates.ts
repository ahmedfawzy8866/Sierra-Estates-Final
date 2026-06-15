/**
 * LEILA'S MESSAGE TEMPLATES (STAGE 9)
 * High-fidelity, warm, professional responses for deal closing.
 */
export const leilaTemplates = {
  viewingFollowUp: {
    en: "I hope you enjoyed the viewing of {propertyName}, {leadName}. It's a truly exceptional property. I've prepared a detailed investment proposal for your review.",
    ar: "أتمنى أن تكون قد استمتعت بمعاينة {propertyName}، يا {leadName}. لقد قمت بإعداد عرض استثماري مفصّل."
  },
  proposalReady: {
    en: "The proposal for {propertyName} is ready for your signature, {leadName}. Review and sign digitally here: {link}",
    ar: "العرض ل— {propertyName} جاهز لتوقيعك، يا {leadName}. راجع ووقّع هنا: {link}"
  },
  signingComplete: {
    en: "Excellent news, {leadName}! The documents for {propertyName} are now fully signed. Moving to final closing phase.",
    ar: "أخبار رائعة يا {leadName}! المستندات موقّعة بالكامل."
  },
};

export const getTemplate = (key: keyof typeof leilaTemplates, locale: 'en' | 'ar' = 'en') =>
  leilaTemplates[key][locale];
