import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Brain, Clock, ExternalLink } from 'lucide-react';
import { ITopic } from '@/lib/api';

interface TopicCardProps {
  topic: ITopic;
  onStudy: (topicId: string) => void;
  onAssessment: (topicId: string) => void;
  progress?: number;
}

export const TopicCard: React.FC<TopicCardProps> = ({ 
  topic, 
  onStudy, 
  onAssessment, 
  progress = 0 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      <Card className="cyber-card h-full hover-glow group relative overflow-hidden">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-cyber-gradient opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <CardHeader className="relative z-10">
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg font-bold text-foreground group-hover:text-white transition-colors duration-300">
              {topic.name}
            </CardTitle>
            {topic.sourceURL && (
              <Button variant="ghost" size="sm" className="p-1 opacity-70 hover:opacity-100">
                <ExternalLink className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="text-xs">
              {topic.sourceTitle}
            </Badge>
            <Badge variant="outline" className="text-xs">
              <BookOpen className="w-3 h-3 mr-1" />
              {topic.flashcards.length} cards
            </Badge>
            <Badge variant="outline" className="text-xs">
              <Brain className="w-3 h-3 mr-1" />
              {topic.assessment.length} questions
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="relative z-10 space-y-4">
          <p className="text-muted-foreground group-hover:text-gray-200 transition-colors duration-300 line-clamp-2">
            {topic.description}
          </p>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="text-primary font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="flex space-x-2 pt-2">
            <Button
              onClick={() => onStudy(topic._id)}
              variant="default"
              className="flex-1 bg-neon-gradient hover:shadow-glow-primary transition-all duration-300"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Study
            </Button>
            <Button
              onClick={() => onAssessment(topic._id)}
              variant="outline"
              className="flex-1 cyber-border hover:shadow-glow-accent transition-all duration-300"
            >
              <Brain className="w-4 h-4 mr-2" />
              Test
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};