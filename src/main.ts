import bootstrapFn from '@/bootstrap';

const bootstrap = bootstrapFn as () => Promise<void>;

void (async (): Promise<void> => {
  try {
    await bootstrap();
  } catch (error) {
    console.error('Failed to bootstrap application:', error);
    process.exit(1);
  }
})();
