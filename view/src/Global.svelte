<style global>
  @tailwind base;

  .center-main {
    @apply flex justify-center;
  }

  .main {
    @apply p-4 mb-24 flex-grow overflow-auto;
    max-width: 768px;
  }

  @screen lg {
    .main {
      width: 768px;
    }
  }

  .content h1 {
    @apply text-2xl font-semibold mt-4 mb-2;
  }

  .content h2 {
    @apply text-xl font-semibold mt-6 mb-4 border-b;
  }

  .content h3 {
    @apply text-lg font-semibold mt-4 mb-2;
  }

  .content h4,
  h5,
  h6 {
    @apply font-semibold mt-6 mb-2;
  }

  .content a,
  .link {
    @apply text-blue-600 underline break-words break-all;
  }

  .content ul {
    @apply list-disc pl-12 my-4;
  }

  .content ol {
    @apply list-decimal pl-12 my-4;
  }

  .content ul ul,
  .content ul ol,
  .content ol ul,
  .content ol ol {
    @apply pl-6 my-0;
  }

  .content .math-inline,
  .content .math-inline svg {
    @apply inline;
  }

  .content p {
    @apply mb-2;
  }

  .content blockquote {
    @apply text-gray-600 border-l-4 pl-4 my-6;
  }

  .content pre {
    @apply my-6;
  }

  .content code {
    @apply rounded px-2 py-1 bg-gray-100;
  }

  .content pre > code {
    @apply overflow-auto block text-sm border rounded px-3 py-3 bg-gray-100;
  }

  .content table {
    @apply my-3;
  }

  .content table tr, .content table td, .content table th {
    @apply border px-2 py-1;
  }

  .content hr {
    @apply my-4;
  }

  @tailwind components;
  @tailwind utilities;
</style>
