'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchStore } from '@/stores/search-store';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Mail } from 'lucide-react';
import Link from 'next/link';

export default function FindEmailPage() {
  const [companyName, setCompanyName] = useState('');
  const [fullName, setFullName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [location, setLocation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { setSelectedCompany, setSelectedEmployee } = useSearchStore();
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !fullName.trim()) return;
    
    setIsLoading(true);
    
    try {
      // ✅ Save company and employee to database first
      const response = await fetch('/api/employees/direct-input', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: companyName.trim(),
          fullName: fullName.trim(),
          jobTitle: jobTitle.trim() || 'Professional',
          location: location.trim() || '',
        }),
      });

      const result = await response.json();
      
      if (response.ok) {
        setSelectedCompany(result.company);
        setSelectedEmployee(result.employee);
        router.push('/emails');
      } else {
        console.error('Failed to save direct input:', result.error);
      }
    } catch (error) {
      console.error('Error in direct input:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 pb-8 max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <Link 
          href="/dashboard" 
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Find Email Address</h1>
          <p className="text-gray-600">
            Provide contact details to find their email address and generate a personalized message.
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
              Company Name *
            </label>
            <input 
              id="companyName"
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g., Airbnb, McKinsey, Spotify"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <input 
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g., Sarah Johnson, Pierre Dubois"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700 mb-2">
              Job Title (optional)
            </label>
            <input 
              id="jobTitle"
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g., Marketing Manager, Software Engineer"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
              Location (optional)
            </label>
            <input 
              id="location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Paris, London, New York, Remote"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <Button 
            type="submit" 
            disabled={isLoading || !companyName.trim() || !fullName.trim()}
            className="w-full"
            size="lg"
          >
            <Mail className="mr-2 h-5 w-5" />
            {isLoading ? 'Finding Email...' : 'Find Email Address & Generate Message'}
          </Button>
        </form>
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              💡 Pro tip
            </h3>
            <p className="mt-1 text-sm text-blue-700">
              Adding job title and location helps us find more accurate email addresses and create better personalized messages.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}