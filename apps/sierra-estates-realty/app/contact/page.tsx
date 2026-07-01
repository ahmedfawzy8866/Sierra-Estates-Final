'use client';

import React, { useState, useEffect } from 'react';
import { useI18n } from '@/lib/I18nContext';

const COPY = {
  en: {
    dir: 'ltr' as const,
    eyebrow: 'Get in Touch',
    pageTitle: 'Contact Us',
    quickContact: [
      { icon: '💬', title: 'WhatsApp', desc: 'Instant chat with our team', linkText: 'Message Us', link: 'https://wa.me/201001234567' },
      { icon: '📧', title: 'Email', desc: 'For detailed inquiries', linkText: 'Email', link: 'mailto:hello@sierraestates.com' },
      { icon: '📞', title: 'Phone', desc: 'Speak with a specialist', linkText: 'Call', link: 'tel:+20233223456' }
    ],
    hoursTitle: 'Office Hours',
    hours: [
      'Monday – Friday: 9:00 AM – 6:00 PM (EET)',
      'Saturday: 10:00 AM – 4:00 PM',
      'Sunday: Closed'
    ],
    officesTitle: 'Offices',
    offices: [
      { name: 'HQ · New Cairo', addr: 'Sheikh Zayed City, New Cairo\\nBuilding A, Floor 3\\nNew Cairo, Egypt', phone: '+20 (2) 3322-3456' },
      { name: 'Virtual Office', addr: 'Available for video consultations worldwide', phone: 'Via Zoom · Schedule below' }
    ],
    socialTitle: 'Connect With Us',
    social: [
      { name: 'LinkedIn', url: '#' },
      { name: 'Instagram', url: '#' },
      { name: 'Facebook', url: '#' }
    ],
    form: {
      fname: 'First Name',
      lname: 'Last Name',
      email: 'Email',
      phone: 'Phone',
      topic: 'Topic',
      topicOpts: [
        { val: '', label: 'Select a topic' },
        { val: 'property-inquiry', label: 'Property Inquiry' },
        { val: 'investment', label: 'Investment Opportunity' },
        { val: 'support', label: 'Support Request' },
        { val: 'partnership', label: 'Partnership' },
        { val: 'careers', label: 'Careers' },
        { val: 'other', label: 'Other' }
      ],
      message: 'Message',
      submitBtn: 'Send Message',
      submitting: 'Sending…',
      success: "Message sent! We'll respond within 24 hours.",
      error: 'Something went wrong. Please try again or reach us on WhatsApp.'
    }
  },
  ar: {
    dir: 'rtl' as const,
    eyebrow: 'تواصل معنا',
    pageTitle: 'اتصل بنا',
    quickContact: [
      { icon: '💬', title: 'واتساب', desc: 'محادثة فورية مع فريقنا', linkText: 'راسلنا', link: 'https://wa.me/201001234567' },
      { icon: '📧', title: 'البريد الإلكتروني', desc: 'للاستفسارات التفصيلية', linkText: 'إرسال بريد', link: 'mailto:hello@sierraestates.com' },
      { icon: '📞', title: 'هاتف', desc: 'تحدث مع أخصائي', linkText: 'اتصل', link: 'tel:+20233223456' }
    ],
    hoursTitle: 'ساعات العمل',
    hours: [
      'الاثنين – الجمعة: 9:00 صباحاً – 6:00 مساءً (EET)',
      'السبت: 10:00 صباحاً – 4:00 مساءً',
      'الأحد: مغلق'
    ],
    officesTitle: 'المكاتب',
    offices: [
      { name: 'المقر الرئيسي · القاهرة الجديدة', addr: 'مدينة الشيخ زايد، القاهرة الجديدة\\nالمبنى أ، الطابق 3\\nالقاهرة الجديدة، مصر', phone: '+20 (2) 3322-3456' },
      { name: 'مكتب افتراضي', addr: 'متاح للاستشارات عبر الفيديو عالمياً', phone: 'عبر زووم · احجز أدناه' }
    ],
    socialTitle: 'تواصل معنا',
    social: [
      { name: 'لينكد إن', url: '#' },
      { name: 'إنستغرام', url: '#' },
      { name: 'فيسبوك', url: '#' }
    ],
    form: {
      fname: 'الاسم الأول',
      lname: 'اسم العائلة',
      email: 'البريد الإلكتروني',
      phone: 'رقم الهاتف',
      topic: 'الموضوع',
      topicOpts: [
        { val: '', label: 'اختر موضوعاً' },
        { val: 'property-inquiry', label: 'استفسار عن عقار' },
        { val: 'investment', label: 'فرصة استثمارية' },
        { val: 'support', label: 'طلب دعم' },
        { val: 'partnership', label: 'شراكة' },
        { val: 'careers', label: 'وظائف' },
        { val: 'other', label: 'أخرى' }
      ],
      message: 'الرسالة',
      submitBtn: 'إرسال الرسالة',
      submitting: 'جارٍ الإرسال…',
      success: 'تم إرسال رسالتك! سنرد عليك خلال ٢٤ ساعة.',
      error: 'حدث خطأ ما. يرجى المحاولة مرة أخرى أو التواصل عبر واتساب.'
    }
  }
};

type SubmitStatus = 'idle' | 'submitting' | 'success' | 'error';

export default function ContactPage() {
  const { locale } = useI18n();
  const [mounted, setMounted] = useState(false);
  const [status, setStatus] = useState<SubmitStatus>('idle');

  useEffect(() => setMounted(true), []);

  const lang = locale === 'ar' ? 'ar' : 'en';
  const T = COPY[lang];

  if (!mounted) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    const fname = (data.get('fname') as string)?.trim() ?? '';
    const lname = (data.get('lname') as string)?.trim() ?? '';
    const topic = (data.get('topic') as string)?.trim() ?? '';
    const message = (data.get('message') as string)?.trim() ?? '';

    setStatus('submitting');
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: [fname, lname].filter(Boolean).join(' '),
          email: data.get('email'),
          phone: data.get('phone') || undefined,
          message: topic ? `[${topic}] ${message}` : message,
          locale: lang,
        }),
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      setStatus('success');
      form.reset();
    } catch {
      setStatus('error');
    }
  };

  return (
    <div dir={T.dir} className={`min-h-screen bg-[var(--ivory)] text-[var(--navy)] pb-20 ${lang === 'ar' ? 'arabic-ready' : 'font-se-ui'}`}>
      <div className="max-w-[1240px] mx-auto px-7 pt-24">
        
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2.5 text-[10px] font-semibold tracking-[0.28em] uppercase text-[var(--gold)] mb-4">
            <span className="w-5 h-[1px] bg-[var(--gold)]" />
            {T.eyebrow}
          </div>
          <h1 className="font-se-display text-[clamp(42px,6vw,64px)] leading-[1.1] font-semibold text-[var(--navy)] mb-4">
            {T.pageTitle}
          </h1>
        </div>

        {/* Quick Contact */}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-6 mb-20">
          {T.quickContact.map((qc, i) => (
            <div key={i} className="p-7 bg-gradient-to-br from-[rgba(200,150,26,0.04)] to-[rgba(200,150,26,0.01)] border border-[rgba(200,150,26,0.15)] rounded-xl text-center">
              <div className="text-[32px] mb-3">{qc.icon}</div>
              <div className="font-se-display text-[16px] font-semibold text-[var(--navy)] mb-2">{qc.title}</div>
              <div className="text-[12px] text-[#7C7766] mb-3">{qc.desc}</div>
              <a href={qc.link} className="inline-block py-2 px-3.5 bg-[var(--gold)] text-white rounded-md text-[11px] font-bold tracking-[0.08em] hover:opacity-90 transition-opacity">
                {qc.linkText}
              </a>
            </div>
          ))}
        </div>

        {/* Contact Form and Info */}
        <div className="grid md:grid-cols-2 gap-12 mb-20">
          
          {/* Info */}
          <div className="flex flex-col gap-8">
            <div>
              <h3 className="font-se-display text-[20px] font-semibold text-[var(--navy)] mb-3">{T.hoursTitle}</h3>
              <p className="text-[14px] text-[#7C7766] leading-[1.7]">
                {T.hours.map((line, i) => (
                  <React.Fragment key={i}>{line}<br/></React.Fragment>
                ))}
              </p>
            </div>
            
            <div>
              <h3 className="font-se-display text-[20px] font-semibold text-[var(--navy)] mb-3">{T.officesTitle}</h3>
              {T.offices.map((office, i) => (
                <div key={i} className="p-6 bg-white border border-[rgba(13,32,53,0.1)] rounded-xl mb-5">
                  <div className="font-se-display text-[16px] font-semibold text-[var(--navy)] mb-1.5">{office.name}</div>
                  <div className="text-[12px] text-[#7C7766] leading-[1.7] mb-3">
                    {office.addr.split('\\n').map((line, j) => <React.Fragment key={j}>{line}<br/></React.Fragment>)}
                  </div>
                  <div className="text-[12px] font-semibold text-[var(--navy)]">{office.phone}</div>
                </div>
              ))}
            </div>

            <div>
              <h3 className="font-se-display text-[20px] font-semibold text-[var(--navy)] mb-3">{T.socialTitle}</h3>
              <p className="text-[14px] text-[#7C7766]">
                {T.social.map((s, i) => (
                  <React.Fragment key={i}>
                    <a href={s.url} className="text-[var(--gold)] font-semibold hover:text-[var(--navy)] transition-colors">{s.name}</a>
                    {i < T.social.length - 1 && ' · '}
                  </React.Fragment>
                ))}
              </p>
            </div>
          </div>

          {/* Form */}
          <div>
            <form onSubmit={handleSubmit} className="bg-white border border-[rgba(13,32,53,0.1)] rounded-2xl p-8">
              <div className="grid grid-cols-2 gap-4 mb-5">
                <div className="flex flex-col">
                  <label htmlFor="fname" className="text-[12px] font-semibold text-[var(--navy)] uppercase tracking-[0.06em] mb-2">{T.form.fname}</label>
                  <input type="text" id="fname" name="fname" required className="p-3 border border-[rgba(13,32,53,0.1)] rounded-lg font-se-ui text-[13px] text-[var(--navy)] bg-[rgba(247,244,236,0.4)] focus:outline-none focus:border-[var(--gold)] focus:bg-white focus:ring-2 focus:ring-[rgba(200,150,26,0.08)] transition-all" />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="lname" className="text-[12px] font-semibold text-[var(--navy)] uppercase tracking-[0.06em] mb-2">{T.form.lname}</label>
                  <input type="text" id="lname" name="lname" required className="p-3 border border-[rgba(13,32,53,0.1)] rounded-lg font-se-ui text-[13px] text-[var(--navy)] bg-[rgba(247,244,236,0.4)] focus:outline-none focus:border-[var(--gold)] focus:bg-white focus:ring-2 focus:ring-[rgba(200,150,26,0.08)] transition-all" />
                </div>
              </div>

              <div className="flex flex-col mb-5">
                <label htmlFor="email" className="text-[12px] font-semibold text-[var(--navy)] uppercase tracking-[0.06em] mb-2">{T.form.email}</label>
                <input type="email" id="email" name="email" required className="p-3 border border-[rgba(13,32,53,0.1)] rounded-lg font-se-ui text-[13px] text-[var(--navy)] bg-[rgba(247,244,236,0.4)] focus:outline-none focus:border-[var(--gold)] focus:bg-white focus:ring-2 focus:ring-[rgba(200,150,26,0.08)] transition-all" />
              </div>

              <div className="flex flex-col mb-5">
                <label htmlFor="phone" className="text-[12px] font-semibold text-[var(--navy)] uppercase tracking-[0.06em] mb-2">{T.form.phone}</label>
                <input type="tel" id="phone" name="phone" className="p-3 border border-[rgba(13,32,53,0.1)] rounded-lg font-se-ui text-[13px] text-[var(--navy)] bg-[rgba(247,244,236,0.4)] focus:outline-none focus:border-[var(--gold)] focus:bg-white focus:ring-2 focus:ring-[rgba(200,150,26,0.08)] transition-all" />
              </div>

              <div className="flex flex-col mb-5">
                <label htmlFor="topic" className="text-[12px] font-semibold text-[var(--navy)] uppercase tracking-[0.06em] mb-2">{T.form.topic}</label>
                <select id="topic" name="topic" required className="p-3 border border-[rgba(13,32,53,0.1)] rounded-lg font-se-ui text-[13px] text-[var(--navy)] bg-[rgba(247,244,236,0.4)] focus:outline-none focus:border-[var(--gold)] focus:bg-white focus:ring-2 focus:ring-[rgba(200,150,26,0.08)] transition-all">
                  {T.form.topicOpts.map((opt, i) => (
                    <option key={i} value={opt.val}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col mb-5">
                <label htmlFor="message" className="text-[12px] font-semibold text-[var(--navy)] uppercase tracking-[0.06em] mb-2">{T.form.message}</label>
                <textarea id="message" name="message" required className="min-h-[120px] p-3 border border-[rgba(13,32,53,0.1)] rounded-lg font-se-ui text-[13px] text-[var(--navy)] bg-[rgba(247,244,236,0.4)] focus:outline-none focus:border-[var(--gold)] focus:bg-white focus:ring-2 focus:ring-[rgba(200,150,26,0.08)] transition-all resize-y"></textarea>
              </div>

              <button type="submit" disabled={status === 'submitting'} className="w-full inline-flex items-center justify-center py-3.5 px-8 border-none rounded-[10px] cursor-pointer font-se-ui text-[11px] font-bold tracking-[0.12em] uppercase text-white bg-gradient-to-br from-[var(--gold-lt)] to-[var(--gold)] shadow-[0_6px_18px_rgba(200,150,26,0.28)] transition-all duration-300 hover:-translate-y-[2px] hover:shadow-[0_10px_28px_rgba(200,150,26,0.4)] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0">
                {status === 'submitting' ? T.form.submitting : T.form.submitBtn}
              </button>

              {status === 'success' && (
                <p role="status" className="mt-4 text-[13px] font-semibold text-emerald-600 text-center">
                  {T.form.success}
                </p>
              )}
              {status === 'error' && (
                <p role="alert" className="mt-4 text-[13px] font-semibold text-red-600 text-center">
                  {T.form.error}
                </p>
              )}
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
