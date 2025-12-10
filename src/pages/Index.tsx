import React, { useState } from 'react';
import { Code, Users, Zap, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CreateSessionDialog } from '@/components/CreateSessionDialog';

const features = [
  {
    icon: Code,
    title: 'Multi-Language Support',
    description: 'JavaScript, TypeScript, and Python with syntax highlighting',
  },
  {
    icon: Users,
    title: 'Real-Time Collaboration',
    description: 'See code changes instantly as candidates type',
  },
  {
    icon: Zap,
    title: 'Live Execution',
    description: 'Run code directly in the browser and see results',
  },
  {
    icon: Globe,
    title: 'Easy Sharing',
    description: 'Create a session and share the link with one click',
  },
];

const Index: React.FC = () => {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4">
        {/* Background glow */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-[500px] w-[500px] rounded-full bg-[radial-gradient(ellipse_at_center,_hsl(190_95%_50%_/_0.15),_transparent_70%)]" />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl text-center">
          {/* Logo/Brand */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-2 backdrop-blur-sm animate-fade-in">
            <Code className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">CodeInterview</span>
          </div>

          {/* Headline */}
          <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight text-foreground md:text-7xl animate-fade-in" style={{ animationDelay: '0.1s' }}>
            Conduct Coding
            <br />
            <span className="text-gradient glow-text">Interviews Live</span>
          </h1>

          {/* Subheadline */}
          <p className="mb-10 max-w-2xl mx-auto text-lg text-muted-foreground md:text-xl animate-fade-in" style={{ animationDelay: '0.2s' }}>
            A real-time collaborative coding platform for technical interviews.
            Share a link, write code together, and evaluate candidates instantly.
          </p>

          {/* CTA Button */}
          <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <Button
              variant="hero"
              size="xl"
              onClick={() => setDialogOpen(true)}
            >
              Start Interview Session
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="relative z-10 mt-24 grid max-w-5xl grid-cols-1 gap-6 px-4 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group rounded-xl border border-border bg-card/50 p-6 backdrop-blur-sm transition-all duration-300 hover:border-primary/50 hover:bg-card animate-fade-in"
              style={{ animationDelay: `${0.4 + index * 0.1}s` }}
            >
              <feature.icon className="mb-4 h-8 w-8 text-primary transition-transform duration-300 group-hover:scale-110" />
              <h3 className="mb-2 font-semibold text-foreground">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Create Session Dialog */}
      <CreateSessionDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
};

export default Index;
