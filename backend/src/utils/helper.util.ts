export const decoder = (str: string) =>
    decodeURIComponent(JSON.parse('"' + str.replace(/\"/g, '\\"') + '"'));