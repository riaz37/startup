"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Eye, Mail, Calendar, Clock } from "lucide-react";

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface EmailTemplateCardProps {
  template: EmailTemplate;
  onEdit: (template: EmailTemplate) => void;
  onDelete: (id: string) => void;
  onPreview?: (template: EmailTemplate) => void;
}

export function EmailTemplateCard({ template, onEdit, onDelete, onPreview }: EmailTemplateCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Card className="border-0 shadow-sm hover:shadow-lg transition-all duration-200 group">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                <Mail className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors duration-200">
                  {template.name}
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {template.subject}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Badge 
                variant={template.isActive ? "default" : "secondary"}
                className={`${
                  template.isActive 
                    ? "bg-green-100 text-green-800 border-green-200" 
                    : "bg-gray-100 text-gray-800 border-gray-200"
                }`}
              >
                {template.isActive ? "Active" : "Inactive"}
              </Badge>
              
              <div className="flex items-center text-xs text-muted-foreground">
                <Calendar className="h-3 w-3 mr-1" />
                {formatDate(template.createdAt)}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="mb-4">
          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
            {template.content.length > 150 
              ? `${template.content.substring(0, 150)}...` 
              : template.content
            }
          </p>
        </div>
        
        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          <div className="flex items-center text-xs text-muted-foreground">
            <Clock className="h-3 w-3 mr-1" />
            Updated {formatDate(template.updatedAt)}
          </div>
          
          <div className="flex space-x-2">
            {onPreview && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPreview(template)}
                className="h-8 px-3 border-border hover:border-primary hover:bg-primary/5 transition-all duration-200"
              >
                <Eye className="h-4 w-4 mr-1" />
                Preview
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(template)}
              className="h-8 px-3 border-border hover:border-primary hover:bg-primary/5 transition-all duration-200"
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(template.id)}
              className="h-8 px-3 border-red-200 text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300 transition-all duration-200"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 