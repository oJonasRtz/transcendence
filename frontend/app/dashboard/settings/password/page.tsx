import SettingsForm from '@/app/ui/dashboard/settings-form';
import { changePassword } from '@/app/actions/profile';

export default function ChangePasswordPage() {
  return (
    <SettingsForm
      title="Change Password"
      description="Update your account password. Must contain uppercase, lowercase, numbers, and special characters."
      action={changePassword}
    >
      {/* Current Password */}
      <div>
        <label htmlFor="currentPassword" className="block text-sm font-medium text-slate-300 mb-2">
          <span className="text-blue-400">01</span> // Current Password
        </label>
        <input
          type="password"
          id="currentPassword"
          name="currentPassword"
          required
          placeholder="Enter current password"
          className="w-full px-4 py-3 rounded-lg
                     bg-white/5 border border-white/10
                     text-white placeholder-slate-500
                     focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50
                     transition-all duration-300"
        />
      </div>

      {/* New Password */}
      <div>
        <label htmlFor="newPassword" className="block text-sm font-medium text-slate-300 mb-2">
          <span className="text-blue-400">02</span> // New Password
        </label>
        <input
          type="password"
          id="newPassword"
          name="newPassword"
          required
          minLength={8}
          placeholder="Enter new password"
          className="w-full px-4 py-3 rounded-lg
                     bg-white/5 border border-white/10
                     text-white placeholder-slate-500
                     focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50
                     transition-all duration-300"
        />
        <p className="mt-2 text-xs text-slate-500 font-mono">
          Min 8 characters. Must include uppercase, lowercase, number, and special character.
        </p>
      </div>

      {/* Confirm Password */}
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-2">
          <span className="text-blue-400">03</span> // Confirm New Password
        </label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          required
          minLength={8}
          placeholder="Confirm new password"
          className="w-full px-4 py-3 rounded-lg
                     bg-white/5 border border-white/10
                     text-white placeholder-slate-500
                     focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50
                     transition-all duration-300"
        />
      </div>
    </SettingsForm>
  );
}
