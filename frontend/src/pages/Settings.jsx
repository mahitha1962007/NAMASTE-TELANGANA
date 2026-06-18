import AnimatedPageWrapper from '../components/AnimatedPageWrapper';
import PageHeader from '../components/PageHeader';
import { Settings as SettingsIcon, Database, Shield, Globe } from 'lucide-react';

export default function Settings() {
  return (
    <AnimatedPageWrapper>
      <PageHeader title="Settings" subtitle="System configuration and preferences" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary-100 rounded-xl"><SettingsIcon className="w-5 h-5 text-primary-600" /></div>
            <h3 className="text-base font-semibold text-gray-900">General</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <span className="text-sm text-gray-700">App Name</span>
              <span className="text-sm font-medium text-gray-900">Editorial Content Planner</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <span className="text-sm text-gray-700">Version</span>
              <span className="text-sm font-medium text-gray-900">1.0.0</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <span className="text-sm text-gray-700">Organization</span>
              <span className="text-sm font-medium text-gray-900">Namaste Telangana</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-100 rounded-xl"><Database className="w-5 h-5 text-emerald-600" /></div>
            <h3 className="text-base font-semibold text-gray-900">Database</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <span className="text-sm text-gray-700">Mode</span>
              <span className="text-sm font-medium text-emerald-600">Connected</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <span className="text-sm text-gray-700">Type</span>
              <span className="text-sm font-medium text-gray-900">MySQL</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-violet-100 rounded-xl"><Shield className="w-5 h-5 text-violet-600" /></div>
            <h3 className="text-base font-semibold text-gray-900">Security</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <span className="text-sm text-gray-700">Authentication</span>
              <span className="text-sm font-medium text-gray-900">JWT</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <span className="text-sm text-gray-700">Password Hashing</span>
              <span className="text-sm font-medium text-gray-900">bcrypt</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <span className="text-sm text-gray-700">Headers</span>
              <span className="text-sm font-medium text-gray-900">Helmet.js</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-amber-100 rounded-xl"><Globe className="w-5 h-5 text-amber-600" /></div>
            <h3 className="text-base font-semibold text-gray-900">Deployment</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <span className="text-sm text-gray-700">Frontend</span>
              <span className="text-sm font-medium text-gray-900">Vercel</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <span className="text-sm text-gray-700">Backend</span>
              <span className="text-sm font-medium text-gray-900">Railway</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <span className="text-sm text-gray-700">Database</span>
              <span className="text-sm font-medium text-gray-900">Railway MySQL</span>
            </div>
          </div>
        </div>
      </div>
    </AnimatedPageWrapper>
  );
}
