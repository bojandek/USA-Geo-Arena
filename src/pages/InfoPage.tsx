import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getSitePage, CONTACT_EMAIL } from '@/lib/site-content';
import AdSlot from '@/components/AdSlot';

interface InfoPageProps {
  /** Path segment of the page, e.g. "privacy". */
  slug: string;
}

/**
 * Renders one of the informational pages (About, Privacy, Terms, ...).
 *
 * All of them share the same layout, so the content lives in
 * `src/lib/site-content.ts` and this component only does the presentation.
 */
export default function InfoPage({ slug }: InfoPageProps) {
  const navigate = useNavigate();
  const page = getSitePage(slug);

  if (!page) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-6xl mb-4">🧭</p>
          <h1 className="text-3xl font-bold text-gray-800 font-script mb-4">Page not found</h1>
          <Button onClick={() => navigate('/')} className="rounded-full">
            Back to home
          </Button>
        </div>
      </div>
    );
  }

  const isContact = page.path === 'contact';

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Back */}
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 rounded-full text-gray-700 hover:bg-white/60"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        {/* Heading */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.35 }}
          className="text-center mb-8"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
            <span className="text-4xl">🌍</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 font-script mb-3">
            {page.title}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">{page.lede}</p>
          <p className="text-xs text-gray-400 mt-3">Last updated: {page.updated}</p>
        </motion.div>

        {/* Body */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.35 }}
        >
          <Card className="border-2 border-primary/20 shadow-xl rounded-3xl">
            <CardContent className="p-6 md:p-8 space-y-7">
              {page.sections.map((section, index) => (
                <section key={section.heading ?? `section-${index}`}>
                  {section.heading && (
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 font-script mb-3">
                      {section.heading}
                    </h2>
                  )}

                  {section.paragraphs?.map((paragraph, pIndex) => (
                    <p
                      key={pIndex}
                      className="text-gray-700 leading-relaxed mb-3 last:mb-0"
                    >
                      {paragraph}
                    </p>
                  ))}

                  {section.bullets && (
                    <ul className="space-y-2">
                      {section.bullets.map((bullet, bIndex) => (
                        <li key={bIndex} className="flex gap-3 text-gray-700 leading-relaxed">
                          <span className="text-primary mt-0.5 shrink-0">•</span>
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {section.links && section.links.length > 0 && (
                    <ul className="mt-3 space-y-1">
                      {section.links.map((link) => (
                        <li key={link.href}>
                          <a
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer nofollow"
                            className="text-sm text-primary underline underline-offset-2 hover:text-secondary break-words"
                          >
                            {link.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              ))}

              {isContact && (
                <div className="pt-2">
                  <Button asChild className="rounded-full w-full sm:w-auto">
                    <a href={`mailto:${CONTACT_EMAIL}`}>
                      <Mail className="mr-2 h-4 w-4" />
                      Email us
                    </a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <AdSlot slot="inArticle" className="mt-6" />
        </motion.div>
      </div>
    </div>
  );
}
