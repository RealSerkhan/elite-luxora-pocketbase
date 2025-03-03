import PocketBase from 'pocketbase';

async function main() {
  // 1. Initialize the client with the PocketBase URL
  const pb = new PocketBase('http://185.162.11.43:9090');
  // 2. Optional: Authenticate (if you have user authentication set up)
  // await pb.admins.authWithPassword("admin@example.com", "password123");

  // 3. Create a record in the "posts" collection
  try {
    const newPost = await pb.collection('posts').create({
      title: 'Hello World',
      content: 'This is my first PocketBase post!',
    });
    console.log('Post created:', newPost);
  } catch (err) {
    console.error('Error creating post:', err);
  }


}

// Execute the main function
main();