'use client';

import { 
  HelpCircle, 
  Mail, 
  MessageCircle,
  Clock
} from 'lucide-react';

export default function HelpPage() {
  const faqs = [
    {
      question: "Is this better than LinkedIn Premium?",
      answer: "LinkedIn shows you who's hiring. Bypass shows you who to contact and what to say. Plus, you're not competing with 500 other 'InMail' messages."
    },
    {
      question: "How accurate are the email addresses?",
      answer: "85% accuracy rate. If an email bounces, we'll find another contact at the same company for free."
    },
    {
      question: "Can I try before buying?",
      answer: "Absolutely. Use Bypass completely free – no credit card, no commitment. Most users get their first interview invitation before upgrading."
    },
    {
      question: "Is this legal/ethical?",
      answer: "100%. We only use publicly available information and follow GDPR guidelines. Think of it as smart networking, not cold emailing."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="bg-blue-100 p-3 rounded-full">
            <HelpCircle className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Help & Support</h1>
        <p className="text-xl text-gray-600">
          Get answers to common questions or reach out for personalized help.
        </p>
      </div>

      {/* Contact Support */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="bg-blue-100 p-3 rounded-full">
              <Mail className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Need Personal Help?</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our team is here to help you succeed. Email us with any questions about using Bypass, 
            technical issues, or job search advice.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a 
              href="mailto:nathan.douziech@gmail.com"
              className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Mail className="h-5 w-5" />
              <span>Contact Support</span>
            </a>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>We usually reply within 24 hours</span>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 text-center">
          Frequently Asked Questions
        </h2>
        
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                {faq.question}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Still Need Help */}
      <div className="text-center bg-gray-50 rounded-xl p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          Still Need Help?
        </h3>
        <p className="text-gray-600 mb-6">
          Can't find what you're looking for? We're here to help you succeed.
        </p>
        <a 
          href="mailto:nathan.douziech@gmail.com"
          className="inline-flex items-center space-x-2 bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
        >
          <MessageCircle className="h-5 w-5" />
          <span>Contact Support</span>
        </a>
      </div>
    </div>
  );
}