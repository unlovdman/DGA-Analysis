import React from 'react';
import { motion } from 'framer-motion';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  children,
  className = '',
  disabled,
  onClick,
  onMouseEnter,
  onMouseLeave,
  onFocus,
  onBlur,
  // Extract problematic props to avoid conflicts
  onDrag,
  onDragEnd,
  onDragStart,
  ...props
}) => {
  const baseClasses = 'relative font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden';

  const variantClasses = {
    primary: 'bg-gradient-to-r from-primary-accent to-primary-blue text-white hover:shadow-lg focus:ring-primary-accent shadow-lg',
    secondary: 'bg-gradient-to-r from-secondary-teal to-green-500 text-white hover:shadow-lg focus:ring-secondary-teal shadow-lg',
    outline: 'border-2 border-primary-accent text-primary-accent bg-transparent hover:bg-primary-accent hover:text-white focus:ring-primary-accent',
    ghost: 'text-primary-accent bg-transparent hover:bg-primary-50 focus:ring-primary-accent',
    danger: 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:shadow-lg focus:ring-red-500 shadow-lg'
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
    xl: 'px-10 py-5 text-xl'
  };

  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-7 h-7'
  };

  const combinedClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${fullWidth ? 'w-full' : ''}
    ${className}
  `.trim();

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center space-x-2">
          <motion.div
            className={`border-2 border-current border-t-transparent rounded-full ${iconSizeClasses[size]}`}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <span>Loading...</span>
        </div>
      );
    }

    const iconElement = icon && (
      <span className={iconSizeClasses[size]}>
        {icon}
      </span>
    );

    if (iconPosition === 'right') {
      return (
        <div className="flex items-center justify-center space-x-2">
          <span>{children}</span>
          {iconElement}
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center space-x-2">
        {iconElement}
        <span>{children}</span>
      </div>
    );
  };

  return (
    <motion.button
      className={combinedClasses}
      disabled={disabled || isLoading}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onFocus={onFocus}
      onBlur={onBlur}
      whileHover={{ 
        scale: disabled || isLoading ? 1 : 1.02,
        y: disabled || isLoading ? 0 : -1
      }}
      whileTap={{ 
        scale: disabled || isLoading ? 1 : 0.98,
        y: disabled || isLoading ? 0 : 0
      }}
    >
      {/* Shine effect for primary/secondary variants */}
      {(variant === 'primary' || variant === 'secondary') && !disabled && !isLoading && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          initial={{ x: '-100%' }}
          whileHover={{ x: '100%' }}
          transition={{ duration: 0.6 }}
        />
      )}
      
      {/* Content */}
      <span className="relative z-10">
        {renderContent()}
      </span>
    </motion.button>
  );
};

export default Button; 