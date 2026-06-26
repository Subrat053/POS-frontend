import React from 'react';
import { Construction } from 'lucide-react';
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';

export function Placeholder({ title }) {
  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <Card className="max-w-md w-full border-dashed border-2">
        <CardHeader className="text-center">
          <div className="mx-auto h-12 w-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-2 animate-pulse">
            <Construction className="h-6 w-6" />
          </div>
          <CardTitle>{title || 'Module Under Construction'}</CardTitle>
          <CardDescription>
            This module is scheduled for implementation in a subsequent phase of the deployment plan.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center text-sm text-muted-foreground">
          All UI mock datasets and role permissions are already fully wired into the routing table and store configurations.
        </CardContent>
      </Card>
    </div>
  );
}

export default Placeholder;
