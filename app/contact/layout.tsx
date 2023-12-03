import React from 'react';

interface ContactLayoutProps {
    children: React.ReactNode;
}

const ContactLayout: React.FC<ContactLayoutProps> = ({ children }) => {
  return (
    <div>
        ContactLayout
        {children}
    </div>
  )
}

export default ContactLayout