import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useDebounce } from '@/hooks/use-debounce';

describe('useDebounce', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('should debounce values', () => {
        const { result, rerender } = renderHook(({ val }) => useDebounce(val, 500), {
            initialProps: { val: 'test1' }
        });

        expect(result.current).toBe('test1');

        rerender({ val: 'test2' });
        expect(result.current).toBe('test1'); // Not updated yet

        vi.advanceTimersByTime(500);
        expect(result.current).toBe('test2'); // Updated after delay
    });
});
