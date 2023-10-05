export const commonFiles = {
  global: [
    {
      templates: [
        'README.md',
        {
          file: 'gitignore',
          renameTo: () => '.gitignore',
        },
        {
          file: 'dockerignore',
          renameTo: () => '.dockerignore',
        },
        'Dockerfile',
      ],
    },
  ],
};
