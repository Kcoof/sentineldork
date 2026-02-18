
import React from 'react';
import { DorkCategory } from './types';

export const DORKS_DB: DorkCategory[] = [
  {
    name: "Cloud & Infrastructure",
    icon: "☁️",
    items: [
      {
        id: "c1",
        title: "S3 Buckets (AWS)",
        description: "Find exposed Amazon S3 buckets via listing directories.",
        query: "site:s3.amazonaws.com \"DOMAIN\"",
        impact: "High",
        tags: ["AWS", "Cloud", "Storage"]
      },
      {
        id: "c2",
        title: "Azure Blob Storage",
        description: "Exposed Azure storage containers containing potential documents.",
        query: "site:blob.core.windows.net \"DOMAIN\"",
        impact: "High",
        tags: ["Azure", "Cloud"]
      },
      {
        id: "c3",
        title: "Terraform State Files",
        description: "State files often contain infrastructure passwords and secrets.",
        query: "site:DOMAIN ext:tfstate OR ext:tfvars",
        impact: "High",
        tags: ["Terraform", "Secrets", "DevOps"]
      },
      {
        id: "c4",
        title: "Kubernetes Dashboard",
        description: "Misconfigured K8s dashboards allowing cluster management.",
        query: "site:DOMAIN intitle:\"Kubernetes Dashboard\" inurl:/api/v1",
        impact: "High",
        tags: ["K8s", "Clusters"]
      }
    ]
  },
  {
    name: "API & Modern JS Leakage",
    icon: "🔌",
    items: [
      {
        id: "a1",
        title: "Source Maps",
        description: "Unminified source code leakage through .map files.",
        query: "site:DOMAIN ext:map inurl:/static/ OR inurl:/_next/",
        impact: "Medium",
        tags: ["JS", "SourceCode"]
      },
      {
        id: "a2",
        title: "Firebase Configurations",
        description: "Client-side Firebase API keys and DB locations.",
        query: "site:DOMAIN \"apiKey:\" \"authDomain:\" \"databaseURL:\"",
        impact: "Medium",
        tags: ["Firebase", "NoSQL"]
      },
      {
        id: "a3",
        title: "Swagger / OpenAPI",
        description: "Exposed API documentation allowing endpoint discovery.",
        query: "site:DOMAIN intitle:\"Swagger UI\" OR inurl:\"/swagger-ui.html\"",
        impact: "Medium",
        tags: ["API", "Documentation"]
      },
      {
        id: "a4",
        title: "GraphQL Introspection",
        description: "Identify GraphQL endpoints with introspection enabled.",
        query: "site:DOMAIN inurl:/graphql OR inurl:/graphiql",
        impact: "Medium",
        tags: ["GraphQL", "API"]
      }
    ]
  },
  {
    name: "SaaS & Productivity Secrets",
    icon: "🚀",
    items: [
      {
        id: "s1",
        title: "Public Notion Pages",
        description: "Internal documentation mistakenly made public on Notion.",
        query: "site:notion.so \"DOMAIN\"",
        impact: "High",
        tags: ["Notion", "Leaks"]
      },
      {
        id: "s2",
        title: "Google Drive Spreadsheets",
        description: "Public sheets containing PII or passwords.",
        query: "site:docs.google.com/spreadsheets \"DOMAIN\"",
        impact: "High",
        tags: ["GoogleDrive", "PII"]
      },
      {
        id: "s3",
        title: "Trello Boards",
        description: "Public company project boards.",
        query: "site:trello.com \"DOMAIN\"",
        impact: "Medium",
        tags: ["Trello", "Workflow"]
      }
    ]
  },
  {
    name: "Database & Server Logs",
    icon: "🗄️",
    items: [
      {
        id: "d1",
        title: "SQLite Databases",
        description: "Raw SQLite files downloadable from the web root.",
        query: "site:DOMAIN ext:sqlite OR ext:db OR ext:sql",
        impact: "High",
        tags: ["Database", "FileLeak"]
      },
      {
        id: "d2",
        title: "Environment Files",
        description: "Classic .env leaks containing credentials.",
        query: "site:DOMAIN \"DB_PASSWORD\" OR \"SECRET_KEY\" ext:env",
        impact: "High",
        tags: ["Secrets", "Config"]
      },
      {
        id: "d3",
        title: "PHP Info Pages",
        description: "Detailed server configuration leakage.",
        query: "site:DOMAIN ext:php intitle:\"phpinfo()\"",
        impact: "Medium",
        tags: ["Recon", "Server"]
      },
      {
        id: "d4",
        title: "Jira Dashboard Leak",
        description: "Unauthenticated Jira dashboards showing internal tickets.",
        query: "site:DOMAIN inurl:/Dashboard.jspa intitle:\"System Dashboard\"",
        impact: "Medium",
        tags: ["Jira", "Internal"]
      }
    ]
  }
];
