import React from 'react';
import { Card } from '../components/common/Card';
import { useSettings } from '../contexts/SettingsContext';
import { ToggleSwitch } from '../components/common/ToggleSwitch';
import { NotificationSettings } from '../types';

interface SettingRowProps {
    label: string;
    description: string;
    settingKey: keyof NotificationSettings;
}

export const SettingsPage: React.FC = () => {
    const { settings, updateSettings } = useSettings();

    const handleToggle = (key: keyof NotificationSettings) => {
        updateSettings({
            ...settings,
            [key]: !settings[key],
        });
    };

    const SettingRow: React.FC<SettingRowProps> = ({ label, description, settingKey }) => (
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
            <div>
                <p id={`${settingKey}-label`} className="font-semibold text-gray-800 dark:text-gray-100">{label}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
            </div>
            <ToggleSwitch
                checked={settings[settingKey]}
                onChange={() => handleToggle(settingKey)}
                labelId={`${settingKey}-label`}
            />
        </div>
    );

    return (
        <div className="p-4">
            <header className="mb-8">
                <h1 className="text-4xl font-bold text-center text-gray-800 dark:text-gray-100">Settings</h1>
                <p className="text-center text-gray-500 dark:text-gray-400 mt-2">Manage your app preferences and notifications.</p>
            </header>

            <Card className="max-w-2xl mx-auto !p-0">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                     <h2 className="text-xl font-bold">Notification Preferences</h2>
                </div>
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    <SettingRow
                        label="Friend Activity"
                        description="Get notified when friends complete sessions or level up."
                        settingKey="friendActivity"
                    />
                    <SettingRow
                        label="Motivations"
                        description="Receive motivational messages from your friends."
                        settingKey="motivations"
                    />
                    <SettingRow
                        label="Daily Challenges"
                        description="Get reminders about new daily challenges."
                        settingKey="dailyChallenges"
                    />
                     <SettingRow
                        label="Session Reminders"
                        description="Receive gentle nudges to stay focused during a session."
                        settingKey="sessionReminders"
                    />
                </div>
            </Card>
        </div>
    );
};
