import React, { createContext, useContext, ReactNode } from 'react';

// Create a context for link attributes
const LinkContext = createContext({});

export const LinkProvider = ({ children }: { children: ReactNode }) => {
    return (
        <LinkContext.Provider value={{ target: '_blank', rel: 'noopener noreferrer' }}>
            {children}
        </LinkContext.Provider>
    );
};

export const ModifyLinks = ({ children }: { children: React.ReactNode }) => {
    const linkAttributes = useContext(LinkContext);

    const processChildren = (node: React.ReactNode): React.ReactNode => {
        if (!React.isValidElement(node)) return node;

        // Check if it's an <a> tag and add attributes
        if (node.type === 'a') {
            return React.cloneElement(node, { ...linkAttributes });
        }

        // Recursively process child components if they have children
        if (node.props && node.props.children) {
            return React.cloneElement(node, {
                ...node.props, // Spread existing props
                children: React.Children.map(node.props.children, processChildren), // Map over children
            });
        }

        return node;
    };

    return <>{React.Children.map(children, processChildren)}</>;
};
