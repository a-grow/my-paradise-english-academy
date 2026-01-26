import { useQuery } from '@tanstack/react-query';

const SHEETDB_BASE_URL = 'https://sheetdb.io/api/v1/9ctz2zljbz6wx';

interface SheetDBOptions {
  sheet: string;
  skipHeaders?: boolean;
}

async function fetchSheetData<T>(options: SheetDBOptions): Promise<T[]> {
  const url = `${SHEETDB_BASE_URL}?sheet=${options.sheet}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch ${options.sheet} data`);
  }
  
  const data: T[] = await response.json();
  
  // Skip first row if it contains header names
  if (options.skipHeaders && data.length > 0) {
    const firstRow = data[0] as Record<string, unknown>;
    // Check if first row looks like headers (e.g., ID field equals 'id')
    if (firstRow.id === 'id' || firstRow.ID === 'ID' || firstRow.class_name === 'class_name') {
      return data.slice(1);
    }
  }
  
  return data;
}

// Classes data type
export interface ClassData {
  id?: string;
  class_name: string;
  schedule: string;
  status: string;
}

// Blog data type
export interface BlogData {
  ID?: string;
  title: string;
  date: string;
  content: string;
}

export function useClasses() {
  return useQuery({
    queryKey: ['sheetdb', 'classes'],
    queryFn: () => fetchSheetData<ClassData>({ sheet: 'classes', skipHeaders: true }),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useBlog() {
  return useQuery({
    queryKey: ['sheetdb', 'blog'],
    queryFn: () => fetchSheetData<BlogData>({ sheet: 'blog', skipHeaders: true }),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
