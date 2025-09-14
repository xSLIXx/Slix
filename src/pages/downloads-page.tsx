import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Monitor, FileText } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function DownloadsPage() {
  const { user } = useAuth();

  const handleDownload = () => {
    // In a real implementation, this would trigger the actual download
    window.open("/api/download/prime-ui-desktop", "_blank");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Prime UI Application</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-6">
            {/* App Icon */}
            <div className="w-16 h-16 bg-primary/20 rounded-xl flex items-center justify-center">
              <Monitor className="text-2xl text-primary" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-medium text-foreground">Prime UI Desktop v2.1.0</h4>
              <p className="text-muted-foreground">
                Auto-clicker with advanced color detection and gaming features
              </p>
              <div className="flex items-center space-x-4 mt-2">
                <span className="text-sm text-muted-foreground">Size: 45.2 MB</span>
                <span className="text-sm text-muted-foreground">Updated: Jan 20, 2024</span>
              </div>
            </div>
            <div className="flex flex-col space-y-2">
              <Button
                data-testid="button-download-app"
                onClick={handleDownload}
                disabled={!user || user.isBlocked === true}
                className="flex items-center"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button variant="outline" size="sm" data-testid="button-view-changelog">
                <FileText className="h-4 w-4 mr-2" />
                View Changelog
              </Button>
            </div>
          </div>
          
          {user?.isBlocked && (
            <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-destructive text-sm">
                Your account is blocked and you cannot download the application.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* System Requirements */}
      <Card>
        <CardHeader>
          <CardTitle>System Requirements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-foreground mb-2">Minimum Requirements</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Windows 10 (64-bit)</li>
                <li>• 4 GB RAM</li>
                <li>• 100 MB free disk space</li>
                <li>• Internet connection</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">Recommended</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Windows 11 (64-bit)</li>
                <li>• 8 GB RAM</li>
                <li>• 500 MB free disk space</li>
                <li>• Stable internet connection</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Installation Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Installation Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                1
              </div>
              <p className="text-sm text-muted-foreground">
                Download the Prime UI application using the button above
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                2
              </div>
              <p className="text-sm text-muted-foreground">
                Run the installer as administrator
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                3
              </div>
              <p className="text-sm text-muted-foreground">
                Follow the installation wizard instructions
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                4
              </div>
              <p className="text-sm text-muted-foreground">
                Launch Prime UI and log in with your credentials
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                5
              </div>
              <p className="text-sm text-muted-foreground">
                Enter your access key when prompted
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
