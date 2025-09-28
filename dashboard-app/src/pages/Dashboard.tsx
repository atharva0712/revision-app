import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { TopicCard } from '@/components/TopicCard';
import { Loading } from '@/components/ui/loading';
import { useAuth } from '@/contexts/AuthContext';
import { ApiClient, ITopic } from '@/lib/api';
import { LogOut, Brain, BookOpen, TrendingUp, User } from 'lucide-react';
import cyberHero from '@/assets/cyber-dashboard-hero.jpg';

export const Dashboard: React.FC = () => {
  const { user, token, logout } = useAuth();
  const [topics, setTopics] = useState<ITopic[]>([]);
  const [progress, setProgress] = useState<{ [topicId: string]: number }>({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const apiClient = new ApiClient(token);

  useEffect(() => {
    fetchTopics();
    fetchProgress();
  }, []);

  const fetchTopics = async () => {
    try {
      const response = await apiClient.getTopics();
      if (response.success) {
        setTopics(response.topics);
      }
    } catch (error) {
      console.error('Error fetching topics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProgress = async () => {
    try {
      const response = await apiClient.getAllProgress();
      if (response.success) {
        setProgress(response.progress);
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
    }
  };

  const handleStudy = (topicId: string) => {
    navigate(`/study/${topicId}`);
  };

  const handleAssessment = (topicId: string) => {
    navigate(`/assessment/${topicId}`);
  };

  const handleLogout = () => {
    logout();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-space-gradient flex items-center justify-center">
        <Loading size="lg" text="Loading your dashboard..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-space-gradient">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
          style={{ backgroundImage: `url(${cyberHero})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/60 to-transparent" />
        
        <div className="relative z-10 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between mb-8"
            >
              <div className="flex items-center space-x-4">
                <motion.div
                  className="w-12 h-12 bg-neon-gradient rounded-full flex items-center justify-center"
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Brain className="w-6 h-6 text-primary-foreground" />
                </motion.div>
                <div>
                  <h1 className="text-3xl font-bold bg-neon-gradient bg-clip-text text-transparent">
                    Revision Dashboard
                  </h1>
                  <p className="text-muted-foreground">Master your learning journey</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <Avatar className="cyber-border">
                    <AvatarFallback className="bg-secondary text-secondary-foreground">
                      {user?.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:block">
                    <p className="font-medium text-foreground">{user?.name}</p>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="cyber-border hover:shadow-glow-primary"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="cyber-card">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <BookOpen className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-foreground">{topics.length}</p>
                        <p className="text-sm text-muted-foreground">Topics</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="cyber-card">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-secondary/10 rounded-lg">
                        <Brain className="w-6 h-6 text-secondary" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-foreground">
                          {topics.reduce((acc, topic) => acc + topic.flashcards.length, 0)}
                        </p>
                        <p className="text-sm text-muted-foreground">Flashcards</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="cyber-card">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-accent/10 rounded-lg">
                        <TrendingUp className="w-6 h-6 text-accent" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-foreground">
                          {topics.reduce((acc, topic) => acc + topic.assessment.length, 0)}
                        </p>
                        <p className="text-sm text-muted-foreground">Questions</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="cyber-card">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-neon-purple/10 rounded-lg">
                        <User className="w-6 h-6 text-neon-purple" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-neon-purple">85%</p>
                        <p className="text-sm text-muted-foreground">Average Score</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Topics Grid */}
      <div className="px-6 pb-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-6"
          >
            <h2 className="text-2xl font-bold text-foreground mb-2">Your Learning Topics</h2>
            <p className="text-muted-foreground">Continue your revision journey</p>
          </motion.div>

          {topics.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-center py-12"
            >
              <Card className="cyber-card max-w-md mx-auto">
                <CardContent className="p-8">
                  <Brain className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No Topics Yet</h3>
                  <p className="text-muted-foreground">
                    Your learning topics will appear here once they're added to your account.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <Accordion type="single" collapsible className="w-full space-y-4">
              {Object.entries(
                topics.reduce((acc, topic) => {
                  const sourceTitle = topic.sourceTitle || 'Uncategorized';
                  if (!acc[sourceTitle]) {
                    acc[sourceTitle] = [];
                  }
                  acc[sourceTitle].push(topic);
                  return acc;
                }, {} as Record<string, ITopic[]>)
              ).map(([sourceTitle, topics], index) => (
                <motion.div
                  key={sourceTitle}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                >
                  <AccordionItem value={sourceTitle} className="cyber-card">
                    <AccordionTrigger className="p-6 text-lg font-bold text-foreground">
                      {sourceTitle}
                    </AccordionTrigger>
                    <AccordionContent className="p-6 pt-0">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {topics.map((topic) => (
                          <TopicCard
                            key={topic._id}
                            topic={topic}
                            onStudy={handleStudy}
                            onAssessment={handleAssessment}
                            progress={progress[topic._id] || 0}
                          />
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>
              ))}
            </Accordion>
          )}
        </div>
      </div>
    </div>
  );
};