import { PageHeader } from '@/components/layout/PageHeader';
import { ContactForm } from '@/components/contact/ContactForm';
import { SocialLinks } from '@/components/contact/SocialLinks';
import { Card } from '@/components/ui/Card';
import { Mail, MapPin, Clock } from 'lucide-react';
import { siteConfig } from '@/lib/constants/seo';

export const metadata = {
  title: 'Contact',
  description: 'Get in touch with the Assamese Community USA. We\'d love to hear from you.',
};

export default function ContactPage() {
  return (
    <>
      <PageHeader
        title="Contact Us"
        description="Have questions or want to get involved? We'd love to hear from you."
        breadcrumbs={[{ label: 'Contact' }]}
      />
      <section className="py-12 lg:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <h2 className="font-heading font-semibold text-lg text-earth-800 mb-6">Send us a Message</h2>
                <ContactForm />
              </Card>
            </div>
            <div className="space-y-6">
              <Card>
                <h2 className="font-heading font-semibold text-lg text-earth-800 mb-4">Contact Info</h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 text-sm text-earth-600">
                    <Mail className="h-4 w-4 mt-0.5 text-muga-500 shrink-0" />
                    <a href={`mailto:${siteConfig.contactEmail}`} className="hover:text-gamosa-500 transition-colors">
                      {siteConfig.contactEmail}
                    </a>
                  </div>
                  <div className="flex items-start gap-3 text-sm text-earth-600">
                    <MapPin className="h-4 w-4 mt-0.5 text-muga-500 shrink-0" />
                    <span>United States</span>
                  </div>
                  <div className="flex items-start gap-3 text-sm text-earth-600">
                    <Clock className="h-4 w-4 mt-0.5 text-muga-500 shrink-0" />
                    <span>We typically respond within 24 hours</span>
                  </div>
                </div>
              </Card>
              <Card>
                <h2 className="font-heading font-semibold text-lg text-earth-800 mb-4">Follow Us</h2>
                <SocialLinks />
              </Card>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
