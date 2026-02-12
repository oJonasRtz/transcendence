'use client';

import { useState } from "react"
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';


export default function PasswordField({id, name, className, minLength, disabled, onChange, value}:
	{
		id?: string,
		name?: string,
		className?: string,
		minLength?: number,
		disabled?: boolean,
		value?: string,
		onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
	}) {
	const [showPass, setShowPass] = useState<string>('password');

	const togglePasswordVisibility = () => {
		setShowPass((prev) => (prev === 'password' ? 'text' : 'password'));
	};

	return (
		<div className="relative">
			<input
				type={showPass}
				name={name || "password"}
				id={id || "password"}
				required
				className={className}
				placeholder="••••••••••••"
				minLength={minLength}
				disabled={disabled}
				value={value}
				onChange={onChange}
			/>
			<button
				type="button"
				onClick={togglePasswordVisibility}
				className="absolute inset-y-0 right-0 flex items-center pr-3 text-white/50 hover:text-blue-400"
			>
				{showPass === 'password' ? (
					<EyeIcon className='h-5 w-5' />
				) : (
					<EyeSlashIcon className='h-5 w-5' />
				)}
			</button>
		</div>
	);
}
