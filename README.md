# CRMLight: A Lightweight Sales CRM

This project is a lightweight, role-based Customer Relationship Management (CRM) application built with Next.js and designed for sales teams. It provides distinct experiences for Administrators, Sales Coordinators, and Sales Agents to manage users, accounts, opportunities, and sales activities.

## 1. Project Objective

The primary goal of CRMLight is to provide a focused, intuitive, and efficient tool for sales teams. It avoids the bloat of larger enterprise CRM systems by concentrating on the core workflows of sales management, from user administration to opportunity tracking. The application is built around a clear, role-based access control (RBAC) system to ensure users only see the information and tools relevant to their position.

## 2. Key Features

- **Role-Based Access Control (RBAC)**: The application supports three distinct user roles, with UI and data access tailored to each:
    - **Administrator**: Has full system access. Manages users, coordinators, agents, accounts, and application-wide settings.
    - **Coordinator**: Manages a team of agents, oversees their performance, and can view all accounts and opportunities.
    - **Agent**: Manages their own portfolio of assigned accounts and related sales opportunities.

- **Role-Specific Dashboards**: Each user lands on a dashboard customized for their role, providing an at-a-glance summary of key metrics and tasks.
    - **Agent Dashboard**: Shows personal stats like assigned accounts, open opportunities, and pending activities.
    - **Coordinator/Admin Dashboard**: Provides a high-level view of team performance, total portfolio value, and recent activities across the system.

- **Comprehensive Entity Management**: Full CRUD (Create, Read, Update, Delete) capabilities for core CRM entities, with appropriate permissions:
    - **Users**: Admins can create new users via a two-step email verification simulation, which generates a temporary password.
    - **Coordinators & Agents**: Admins can manage roles and team structures.
    - **Accounts**: Admins/Coordinators can manage all customer accounts.
    - **Opportunities**: Users can track potential sales deals from detection to close.
    - **Activities**: Users can log interactions (calls, emails, meetings) for each opportunity.

- **Application Configuration**: A secure, Administrator-only page for managing system-wide settings. Currently, it includes a form for SMTP server configuration, complete with a "Send Test Email" feature that displays the mock SMTP session in a modal for debugging.

- **Modern & Responsive UI**: Built with ShadCN UI components and Tailwind CSS, the interface is clean, responsive, and includes refined UX details like modal dialogs with a backdrop blur effect.

## 3. Technical Stack & Architecture

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS & ShadCN UI
- **State Management**: Zustand for global user state (`useUserStore`), managing user identity, available roles, and the currently active role.
- **Forms**: React Hook Form with Zod for schema validation.

### Data Model & Backend Simulation

The application operates on a well-defined set of data entities, with type definitions located in `src/types/index.ts`. The primary entities are:
- `User`: The base account for any person logging in.
- `Coordinator` & `Agent`: Roles linked to a `User` ID, defining their capabilities.
- `Account`: A customer company.
- `Contact`: A person associated with an `Account`.
- `Opportunity`: A potential sale linked to an `Account`.
- `Activity`: An action or task related to an `Opportunity`.

For demonstration purposes, the application uses a **mock backend** located in `src/lib/data.ts`. This file exports arrays of data that simulate a database.

The frontend components import this data directly. However, the application logic for **filtering, data joining, and access control** is implemented within the components themselves (e.g., in the `dashboard`, `accounts`, and `opportunities` pages). This simulates the business logic that would typically reside on a server or in an API layer, providing a realistic frontend experience based on the user's active role.

### Security Considerations

- **HTTPS is Mandatory**: For any production deployment, serving the application over **HTTPS** is non-negotiable. This encrypts all communication between the client and the server, protecting sensitive data like user credentials during login and all subsequent data transfers. Relying on client-side obfuscation is not a substitute for proper transport layer security.

## 4. Development Process & Key Decisions

This project was built iteratively, with several key decisions and refactors shaping the final result:

1.  **AI Feature Removal**: An "AI Assistant" for suggesting portfolio assignments was initially included. This feature was subsequently removed to sharpen the project's focus on core CRM functionality and resolve dependency conflicts. This involved a thorough cleanup of AI-related files, components, and server actions to maintain a lean codebase.

2.  **Code Consolidation & DRY Principles**: Post-refactoring, a project-wide review was conducted to eliminate unused code. For instance, a redundant portfolio detail page (`/portfolio/[accountId]`) was removed in favor of a single, robust account detail page (`/accounts/[accountId]`) that handles permissions internally.

3.  **User-Centric UX Refinements**:
    - **SMTP Test Log**: The "Send Test Email" feature was enhanced to show the full SMTP session log.
    - **Modal Experience**: We decided to display the log in a modal dialog to avoid cluttering the UI. The modal's backdrop effect was fine-tuned iteratively from a dark overlay to a more subtle and modern `bg-black/10 backdrop-blur-sm` effect to achieve the desired visual hierarchy and feel.

4.  **Administrator Workflow**: The user creation process was designed to be handled entirely by the Administrator, including a mock verification step and temporary password generation, simulating a secure onboarding flow.

This document serves as a snapshot of the project's current state and the journey taken to get here. It can be used as context to seamlessly resume development in the future.
