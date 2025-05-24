import { describe, it, expect, vi, beforeEach } from 'vitest';
import { linksPage } from '../src/utility/linkspage';
import fs from 'fs';
import { MongoClient } from 'mongodb';

vi.mock('fs');
vi.mock('mongodb', () => {
    const mockCollection = {
        find: vi.fn().mockReturnValue({
            sort: vi.fn().mockReturnValue({
                toArray: vi.fn().mockResolvedValue([]),
            }),
        }),
    };
    const mockDb = {
        collection: vi.fn().mockReturnValue(mockCollection),
    };
    const mockClient = {
        connect: vi.fn(),
        db: vi.fn().mockReturnValue(mockDb),
        close: vi.fn().mockResolvedValue(undefined),
    };
    return { MongoClient: vi.fn(() => mockClient) };
});

describe('linksPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should generate an HTML file with login links', async () => {
        const writeFileSyncMock = vi.spyOn(fs, 'writeFileSync');

        await linksPage();

        expect(MongoClient).toHaveBeenCalled();
        expect(writeFileSyncMock).toHaveBeenCalledWith(
            '/usr/server/src/data/flirtable.html',
            expect.stringContaining('<!DOCTYPE html>'),
            'utf8'
        );
    });

    it('should handle errors gracefully', async () => {
        const consoleErrorMock = vi.spyOn(console, 'error').mockImplementation(() => { });
        const mongoInstance = new MongoClient('dummy_url_for_mock'); // Get the mocked client instance
        vi.spyOn(mongoInstance, 'connect').mockImplementation(() => {
            throw new Error('Connection failed');
        });

        await expect(linksPage()).rejects.toThrow('Connection failed');
        expect(consoleErrorMock).toHaveBeenCalledWith(
            'Error generating links page:',
            expect.any(Error)
        );
    });
});
