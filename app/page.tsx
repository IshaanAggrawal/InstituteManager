"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Mail, ArrowRight, ShieldCheck, TrendingUp, Users, CreditCard, FileText, BarChart3, Calendar, Check, Star, GraduationCap, DollarSign, FileBarChart, BookOpen, Clock, Zap, Globe, Award } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { motion } from 'framer-motion';

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-background via-emerald-50/50 to-primary/5 dark:from-background dark:via-background dark:to-primary/10 relative overflow-hidden">
      {/* Hero Section */}
      <div className="relative z-10">
        {/* Hero Content */}
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-6">
              <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
              Trusted by Educational Institutions
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground mb-6">
              Transform Your <span className="text-primary">Institute Management</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed">
              All-in-one platform to manage students, fees, attendance, and test results with powerful analytics and intuitive interface.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Link href="/dashboard">
                  <Button size="lg" className="h-12 px-8 text-base bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all">
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <Link href="/login">
                  <Button size="lg" className="h-12 px-8 text-base bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              )}
              <Button size="lg" variant="outline" className="h-12 px-8 text-base border-emerald-600 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20">
                View Demo
              </Button>
            </div>
          </div>
        </section>
      </div>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-4">
              Everything You Need in One Place
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Comprehensive tools designed specifically for educational institutions to streamline operations
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Users className="h-6 w-6" />}
              title="Student Management"
              description="Manage student profiles, enrollment, and academic records with ease."
            />
            <FeatureCard 
              icon={<DollarSign className="h-6 w-6" />}
              title="Fee Tracking"
              description="Automate fee collection, generate receipts, and track payments."
            />
            <FeatureCard 
              icon={<FileText className="h-6 w-6" />}
              title="Attendance System"
              description="Digital attendance tracking with real-time reports and analytics."
            />
            <FeatureCard 
              icon={<BarChart3 className="h-6 w-6" />}
              title="Test Results"
              description="Comprehensive exam management and performance analytics."
            />
            <FeatureCard 
              icon={<Calendar className="h-6 w-6" />}
              title="Schedule Management"
              description="Create and manage class schedules, exams, and events."
            />
            <FeatureCard 
              icon={<ShieldCheck className="h-6 w-6" />}
              title="Secure Data"
              description="Enterprise-grade security to protect sensitive student information."
            />
            <FeatureCard 
              icon={<BookOpen className="h-6 w-6" />}
              title="Academic Records"
              description="Complete academic history and grade tracking for each student."
            />
            <FeatureCard 
              icon={<Globe className="h-6 w-6" />}
              title="Parent Portal"
              description="Real-time access for parents to view their child's progress."
            />
            <FeatureCard 
              icon={<Award className="h-6 w-6" />}
              title="Performance Analytics"
              description="Detailed insights into student performance and institutional metrics."
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-4">
              How Institute Manager Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Simple steps to transform your institute management experience
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto mb-6">
                <span className="text-2xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Sign Up & Setup</h3>
              <p className="text-muted-foreground">
                Create your account and customize your institute profile with our easy setup wizard.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto mb-6">
                <span className="text-2xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Add Your Data</h3>
              <p className="text-muted-foreground">
                Import student records, set up fee structures, and configure attendance parameters.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto mb-6">
                <span className="text-2xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Start Managing</h3>
              <p className="text-muted-foreground">
                Begin managing your institute with our intuitive dashboard and powerful tools.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-emerald-50/30 dark:bg-emerald-900/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-4">
              Trusted by Educational Leaders
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              See what educators say about Institute Manager
            </p>
          </div>

          <div className="relative overflow-hidden py-10">
            <div className="flex animate-scroll gap-8">
              <TestimonialCard 
                quote="Institute Manager has transformed how we handle student data. The attendance tracking alone has saved us hours each week."
                author="Sarah Johnson"
                role="Principal, ABC Academy"
              />
              <TestimonialCard 
                quote="The fee management system has eliminated all our billing errors. Our parents love the digital receipts."
                author="Michael Chen"
                role="Admin Director, XYZ Institute"
              />
              <TestimonialCard 
                quote="The test results dashboard gives us insights we never had before. It's helped us improve student outcomes significantly."
                author="Emma Rodriguez"
                role="Academic Coordinator, PQR School"
              />
              <TestimonialCard 
                quote="Managing hundreds of students has never been easier. The parent portal keeps everyone informed and engaged."
                author="David Williams"
                role="Director, LMN Educational Group"
              />
              <TestimonialCard 
                quote="The analytics tools have helped us identify struggling students early and provide targeted support."
                author="Priya Sharma"
                role="Academic Head, EFG International School"
              />
              <TestimonialCard 
                quote="Institute Manager has transformed how we handle student data. The attendance tracking alone has saved us hours each week."
                author="Sarah Johnson"
                role="Principal, ABC Academy"
              />
              <TestimonialCard 
                quote="The fee management system has eliminated all our billing errors. Our parents love the digital receipts."
                author="Michael Chen"
                role="Admin Director, XYZ Institute"
              />
              <TestimonialCard 
                quote="The test results dashboard gives us insights we never had before. It's helped us improve student outcomes significantly."
                author="Emma Rodriguez"
                role="Academic Coordinator, PQR School"
              />
              <TestimonialCard 
                quote="Managing hundreds of students has never been easier. The parent portal keeps everyone informed and engaged."
                author="David Williams"
                role="Director, LMN Educational Group"
              />
              <TestimonialCard 
                quote="The analytics tools have helped us identify struggling students early and provide targeted support."
                author="Priya Sharma"
                role="Academic Head, EFG International School"
              />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to know about Institute Manager
            </p>
          </div>

          <div className="space-y-6">
            <FAQItem 
              question="Is there a free trial available?"
              answer="Yes, we offer a 14-day free trial with full access to all features. No credit card required."
            />
            <FAQItem 
              question="How secure is my data?"
              answer="We use enterprise-grade security measures including end-to-end encryption, secure cloud storage, and regular security audits."
            />
            <FAQItem 
              question="Can I import existing student data?"
              answer="Absolutely! We provide easy-to-use import tools that allow you to migrate data from spreadsheets or other systems."
            />
            <FAQItem 
              question="Do you offer technical support?"
              answer="Yes, we provide 24/7 technical support via email, chat, and phone. We also have an extensive knowledge base."
            />
            <FAQItem 
              question="Is there a mobile app available?"
              answer="We have a responsive web application that works seamlessly on all devices, including smartphones and tablets."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-emerald-600 to-primary">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Institute?
          </h2>
          <p className="text-lg text-emerald-100 max-w-2xl mx-auto mb-8">
            Join thousands of educational institutions already using Institute Manager to streamline operations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Link href="/dashboard">
                <Button size="lg" className="h-12 px-8 text-base bg-white text-emerald-600 hover:bg-emerald-50">
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button size="lg" className="h-12 px-8 text-base bg-white text-emerald-600 hover:bg-emerald-50">
                  Start Free Trial
                </Button>
              </Link>
            )}
            <Button size="lg" variant="outline" className="h-12 px-8 text-base border-white text-white hover:bg-white/10">
              Schedule a Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-emerald-100 dark:border-emerald-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-lg flex items-center justify-center font-bold shadow-lg bg-emerald-600 text-white">
                  IM
                </div>
                <span className="font-bold text-lg tracking-tight text-emerald-900 dark:text-emerald-100">
                  Institute Manager
                </span>
              </div>
              <p className="text-muted-foreground text-sm">
                Comprehensive management solution for educational institutions.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-emerald-600">Features</Link></li>
                <li><Link href="#" className="hover:text-emerald-600">Pricing</Link></li>
                <li><Link href="#" className="hover:text-emerald-600">Security</Link></li>
                <li><Link href="#" className="hover:text-emerald-600">Integrations</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-emerald-600">Documentation</Link></li>
                <li><Link href="#" className="hover:text-emerald-600">Guides</Link></li>
                <li><Link href="#" className="hover:text-emerald-600">API Status</Link></li>
                <li><Link href="#" className="hover:text-emerald-600">Support</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-emerald-600">About</Link></li>
                <li><Link href="#" className="hover:text-emerald-600">Careers</Link></li>
                <li><Link href="#" className="hover:text-emerald-600">Contact</Link></li>
                <li><Link href="#" className="hover:text-emerald-600">Partners</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-emerald-100 dark:border-emerald-900/30 mt-12 pt-8 text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} Institute Manager. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Feature Card Component
function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <Card className="border-emerald-100/50 dark:border-emerald-900/30 bg-white/50 dark:bg-card/30 backdrop-blur-sm hover:shadow-lg transition-all">
      <CardHeader className="pb-3">
        <div className="h-12 w-12 rounded-lg bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4">
          {icon}
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

// Testimonial Card Component
function TestimonialCard({ quote, author, role }: { quote: string; author: string; role: string }) {
  return (
    <Card className="border-emerald-100/50 dark:border-emerald-900/30 bg-white/50 dark:bg-card/30 backdrop-blur-sm min-w-[350px] w-80 h-64 flex-shrink-0">
      <CardHeader className="pb-4">
        <div className="flex gap-1 mb-2">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="h-4 w-4 fill-current text-emerald-500" />
          ))}
        </div>
        <CardDescription className="italic text-sm h-24 overflow-hidden">"{quote}"</CardDescription>
      </CardHeader>
      <CardFooter className="flex flex-col items-start pt-0">
        <span className="font-semibold text-sm">{author}</span>
        <span className="text-xs text-muted-foreground">{role}</span>
      </CardFooter>
    </Card>
  );
}

// FAQ Item Component
function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <Card className="border-emerald-100/50 dark:border-emerald-900/30 bg-white/30 dark:bg-card/20 backdrop-blur-sm">
      <CardHeader className="p-6">
        <CardTitle className="text-lg font-semibold">{question}</CardTitle>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <p className="text-muted-foreground">{answer}</p>
      </CardContent>
    </Card>
  );
}