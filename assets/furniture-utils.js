export async function getFurnitureFileAsBlobUrl(axiosInstance, id, fileName) {
  if(id === undefined || fileName === undefined) return;
  if(id === null || fileName === null) return;
  const resourceUrl = `/api/furniture/${id}/${fileName}`;

  // Open the cache
  const cache = await caches.open('furniture-cache').catch((error) => {
    console.error('Error opening the cache:', error);
  });

  if (cache) {
    // Check if the resource is in the cache
    const cacheMatch = await cache.match(resourceUrl).catch((error) => {
      console.error('Error matching the cache:', error);
    });

    // If the resource is in the cache, return it
    if (cacheMatch) {
      const cachedBlob = await cacheMatch.blob();
      // Create a blob URL for the cached resource
      return URL.createObjectURL(cachedBlob);
    }
  }

  // If the resource is not in the cache, fetch it
  try {
    const response = await axiosInstance.get(resourceUrl, {responseType: 'blob'});
    // Create a blob URL for the fetched resource
    const blobUrl = URL.createObjectURL(response.data);

    // Add the fetched resource to the cache if available
    if (cache) {
      // Create a new Response object with the same data as the original response
      const cacheableResponse = new Response(response.data, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      });

      // Add the Response object to the cache
      // The resourceUrl is used as the cache key
      await cache.put(resourceUrl, cacheableResponse).catch((error) => {
        console.error('Error adding the resource to the cache:', error);
      });
    }

    return blobUrl;
  } catch (error) {
    console.error('Error fetching furniture file:', error);
    return '';
  }
}
