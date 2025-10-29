/**
 * Contact Page Component
 * File: src/pages/ContactPage.tsx
 * Purpose: Professional contact page with company details and support information
 * 
 * This page provides comprehensive contact information, company details,
 * and support options for the GameArena tournament platform
 */

import React from 'react'
import { motion } from 'framer-motion'
import { 
  Mail, 
  Phone, 
  MapPin, 
  MessageCircle, 
  Clock, 
  Shield,
  Heart,
  Users,
  Trophy,
  Zap,
  Star,
  CheckCircle,
  Globe,
  Send,
  HeadphonesIcon,
  Building
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Animation variants for Framer Motion
const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6 }
  }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

const scaleOnHover = {
  whileHover: { scale: 1.05, y: -5 },
  whileTap: { scale: 0.95 }
}

/**
 * ContactPage - Professional contact page with multiple sections
 */
export const ContactPage: React.FC = () => {
  // Contact information
  const contactMethods = [
    {
      title: 'Email Support',
      description: 'Get help with your queries',
      value: 'support@gamearena.com',
      icon: Mail,
      color: 'from-blue-500 to-cyan-500',
      href: 'mailto:support@gamearena.com'
    },
    {
      title: 'WhatsApp Support',  
      description: '24/7 instant messaging',
      value: '+91 98765-43210',
      icon: MessageCircle,
      color: 'from-green-500 to-emerald-500',
      href: 'https://wa.me/919876543210'
    },
    {
      title: 'Phone Support',
      description: 'Direct call support',
      value: '+91 98765-43210',
      icon: Phone,
      color: 'from-purple-500 to-violet-500',
      href: 'tel:+919876543210'
    },
    {
      title: 'Office Location',
      description: 'Visit our headquarters',
      value: 'Mumbai, Maharashtra, India',
      icon: MapPin,
      color: 'from-orange-500 to-red-500',
      href: 'https://maps.google.com'
    }
  ]

  // Company information
  const companyInfo = [
    {
      title: 'Founded',
      value: '2024',
      icon: Building
    },
    {
      title: 'Team Size',
      value: '15+ Members',
      icon: Users
    },
    {
      title: 'Tournaments Hosted',
      value: '500+',
      icon: Trophy
    },
    {
      title: 'Active Players',
      value: '10,000+',
      icon: Star
    }
  ]

  // Support hours
  const supportHours = [
    { day: 'Monday - Friday', hours: '9:00 AM - 10:00 PM' },
    { day: 'Saturday', hours: '10:00 AM - 8:00 PM' },
    { day: 'Sunday', hours: '12:00 PM - 6:00 PM' },
    { day: 'Holidays', hours: 'Limited Support' }
  ]

  // FAQ data
  const faqs = [
    {
      question: 'How do I register for a tournament?',
      answer: 'Navigate to the BGMI or Free Fire page, choose your preferred mode (Solo/Duo/Squad), fill out the registration form with your details, make payment via QR code, and submit. Admin will approve after verifying your payment.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all UPI payments including Google Pay, PhonePe, Paytm, and bank UPI. Scan the QR code or use our UPI ID: gamearena@paytm to make payments.'
    },
    {
      question: 'When will I receive match details?',
      answer: 'Match details including room ID and password will be sent via WhatsApp 30 minutes before the tournament starts. Make sure your WhatsApp number is active and correct.'
    },
    {
      question: 'How are prizes distributed?',
      answer: 'Prizes are distributed within 24 hours after match completion via UPI to the same number used for registration. Winners need to share their match screenshots for verification.'
    },
    {
      question: 'Can I get a refund after registration?',
      answer: 'Refunds are only provided if the tournament is cancelled by GameArena or if your registration is rejected due to technical issues. Player withdrawals are not eligible for refunds.'
    },
    {
      question: 'What if I face technical issues during the tournament?',
      answer: 'Contact us immediately via WhatsApp during the tournament. We provide real-time support and will investigate any technical issues. Valid issues may result in match replays.'
    }
  ]

  // Company values
  const companyValues = [
    {
      title: 'Fair Play',
      description: 'We ensure every tournament is conducted with complete fairness and transparency',
      icon: Shield
    },
    {
      title: 'Community First',
      description: 'Our gaming community is at the heart of everything we do',
      icon: Heart  
    },
    {
      title: 'Innovation',
      description: 'Constantly improving the tournament experience with new features',
      icon: Zap
    },
    {
      title: 'Excellence',
      description: 'Committed to providing the best tournament platform in India',
      icon: Star
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-background/95 to-background/90">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 h-72 w-72 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 h-96 w-96 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative container mx-auto px-4 py-20">
          <motion.div
            initial="initial"
            animate="animate" 
            variants={staggerContainer}
            className="text-center space-y-8"
          >
            <motion.div variants={fadeInUp} className="space-y-4">
              <Badge variant="secondary" className="mb-4">
                <HeadphonesIcon className="mr-1 h-3 w-3" />
                24/7 Support Available
              </Badge>
              
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold">
                Contact{' '}
                <span className="bg-gradient-to-r from-primary via-purple-500 to-cyan-500 bg-clip-text text-transparent">
                  GameArena
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Get in touch with India's premier gaming tournament platform. 
                We're here to help you dominate the battleground!
              </p>
            </motion.div>

            {/* Quick Stats */}
            <motion.div variants={fadeInUp} className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8">
              {companyInfo.map((stat, index) => {
                const Icon = stat.icon
                return (
                  <motion.div
                    key={stat.title}
                    variants={scaleOnHover}
                    className="text-center p-6 rounded-lg bg-card/50 backdrop-blur border"
                  >
                    <Icon className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <div className="text-2xl font-bold text-foreground">
                      {stat.value}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {stat.title}
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="space-y-12"
          >
            <motion.div variants={fadeInUp} className="text-center space-y-4">
              <h2 className="text-3xl md:text-5xl font-bold">
                Get In{' '}
                <span className="bg-gradient-to-r from-primary to-cyan-500 bg-clip-text text-transparent">
                  Touch
                </span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Multiple ways to reach our support team. Choose what works best for you!
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {contactMethods.map((method, index) => {
                const Icon = method.icon
                return (
                  <motion.div
                    key={method.title}
                    variants={fadeInUp}
                    custom={index}
                  >
                    <motion.div variants={scaleOnHover}>
                      <Card className="h-full bg-card/50 backdrop-blur border-2 hover:border-primary/50 transition-all group">
                        <CardHeader className="text-center pb-4">
                          <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-r ${method.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                            <Icon className="h-8 w-8 text-white" />
                          </div>
                          <CardTitle className="text-xl">{method.title}</CardTitle>
                          <p className="text-sm text-muted-foreground">{method.description}</p>
                        </CardHeader>
                        <CardContent className="text-center">
                          <p className="font-semibold mb-4">{method.value}</p>
                          <Button asChild className="w-full">
                            <a href={method.href} target="_blank" rel="noopener noreferrer">
                              <Send className="mr-2 h-4 w-4" />
                              Contact Now
                            </a>
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Support Hours & Company Info */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Support Hours */}
            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <Card className="bg-card/50 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <Clock className="h-6 w-6 text-primary" />
                    Support Hours
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {supportHours.map((schedule, index) => (
                    <div key={index} className="flex justify-between items-center py-2">
                      <span className="font-medium">{schedule.day}</span>
                      <span className="text-muted-foreground">{schedule.hours}</span>
                    </div>
                  ))}
                  <Separator />
                  <Alert>
                    <Globe className="h-4 w-4" />
                    <AlertDescription>
                      WhatsApp support is available 24/7 for urgent queries and tournament issues.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </motion.div>

            {/* Company Values */}
            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <Card className="bg-card/50 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <Heart className="h-6 w-6 text-primary" />
                    Our Values
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {companyValues.map((value, index) => {
                    const Icon = value.icon
                    return (
                      <div key={index} className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold mb-1">{value.title}</h3>
                          <p className="text-sm text-muted-foreground">{value.description}</p>
                        </div>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="space-y-12"
          >
            <motion.div variants={fadeInUp} className="text-center space-y-4">
              <h2 className="text-3xl md:text-5xl font-bold">
                Frequently Asked{' '}
                <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                  Questions
                </span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Quick answers to common questions about GameArena tournaments
              </p>
            </motion.div>

            <motion.div variants={fadeInUp} className="max-w-4xl mx-auto">
              <div className="grid gap-6">
                {faqs.map((faq, index) => (
                  <Card key={index} className="bg-card/50 backdrop-blur">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-semibold text-primary">{index + 1}</span>
                        </div>
                        <div className="space-y-2">
                          <h3 className="font-semibold text-lg">{faq.question}</h3>
                          <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="space-y-12"
          >
            <motion.div variants={fadeInUp} className="text-center space-y-4">
              <h2 className="text-3xl md:text-5xl font-bold">
                About{' '}
                <span className="bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
                  GameArena
                </span>
              </h2>
            </motion.div>

            <motion.div variants={fadeInUp} className="max-w-4xl mx-auto">
              <Card className="bg-gradient-to-r from-primary/5 to-purple-500/5 border-primary/20">
                <CardContent className="p-8 space-y-6">
                  <div className="text-center space-y-4">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-r from-primary to-purple-500 flex items-center justify-center mx-auto">
                      <Trophy className="h-10 w-10 text-white" />
                    </div>
                    
                    <h3 className="text-2xl font-bold">India's Premier Gaming Tournament Platform</h3>
                  </div>

                  <div className="space-y-4 text-muted-foreground leading-relaxed">
                    <p>
                      GameArena was founded in 2024 with a simple mission: to provide Indian gamers 
                      with the most professional, fair, and exciting tournament experience possible. 
                      We started as a small team of passionate gamers who recognized the need for 
                      a trustworthy platform in the Indian esports ecosystem.
                    </p>
                    
                    <p>
                      Today, we host tournaments for BGMI and Free Fire, supporting Solo, Duo, and 
                      Squad formats with real-time slot tracking, instant prize distribution, and 
                      24/7 customer support. Our platform has grown to serve over 10,000 active 
                      players and has successfully hosted 500+ tournaments.
                    </p>

                    <p>
                      What sets us apart is our commitment to transparency, fair play, and community 
                      building. Every tournament is monitored by our experienced team, prizes are 
                      distributed within 24 hours, and we maintain zero tolerance for cheating or 
                      unfair practices.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6 mt-8">
                    <div className="text-center p-4 rounded-lg bg-background/50">
                      <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                      <h4 className="font-semibold">Verified Platform</h4>
                      <p className="text-sm text-muted-foreground">Trusted by thousands of players</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-background/50">
                      <Shield className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                      <h4 className="font-semibold">Secure Payments</h4>
                      <p className="text-sm text-muted-foreground">Safe and instant transactions</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-background/50">
                      <Users className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                      <h4 className="font-semibold">Active Community</h4>
                      <p className="text-sm text-muted-foreground">Growing gaming community</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-20 bg-gradient-to-r from-primary/10 via-purple-500/10 to-cyan-500/10">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="space-y-8 max-w-2xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold">
              Ready to Start Gaming?
            </h2>
            <p className="text-xl text-muted-foreground">
              Join thousands of players and start your tournament journey today
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <a href="https://wa.me/919876543210">
                  <MessageCircle className="mr-2 h-5 w-5" />
                  WhatsApp Support
                </a>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="mailto:support@gamearena.com">
                  <Mail className="mr-2 h-5 w-5" />
                  Email Us
                </a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default ContactPage