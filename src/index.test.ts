import { describe, expect, it } from "vitest";
import { Friday } from "./friday";

describe("Friday Class Methods", () => {
  const jsonPlaceholder = new Friday({
    baseURL: "https://jsonplaceholder.typicode.com",
  });

  const httpBin = new Friday({
    baseURL: "https://httpbin.org",
  });

  it("GET - should fetch a post", async () => {
    const response = await jsonPlaceholder.get(new URL("/posts/1", "https://jsonplaceholder.typicode.com"));
    expect(response?.status).toBe(200);
    expect(response?.data.id).toBe(1);
  });

  it("POST - should create a post", async () => {
    const response = await jsonPlaceholder.post(new URL("/posts", "https://jsonplaceholder.typicode.com"), {
      body: {
        title: "foo",
        body: "bar",
        userId: 1,
      },
    });
    expect(response?.status).toBe(201);
    expect(response?.data.title).toBe("foo");
  });

  it("PUT - should update a post", async () => {
    const response = await jsonPlaceholder.put(new URL("/posts/1", "https://jsonplaceholder.typicode.com"), {
      body: {
        id: 1,
        title: "foo updated",
        body: "bar",
        userId: 1,
      },
    });
    expect(response?.status).toBe(200);
    expect(response?.data.title).toBe("foo updated");
  });

  it("PATCH - should patch a post", async () => {
    const response = await jsonPlaceholder.patch(new URL("/posts/1", "https://jsonplaceholder.typicode.com"), {
      body: {
        title: "foo patched",
      },
    });
    expect(response?.status).toBe(200);
    expect(response?.data.title).toBe("foo patched");
  });

  it("DELETE - should delete a post", async () => {
    const response = await jsonPlaceholder.delete(new URL("/posts/1", "https://jsonplaceholder.typicode.com"));
    expect(response?.status).toBe(200);
  });

  it("UPLOAD - should upload a file", async () => {
    const formData = new FormData();
    // specific file content is not important for this type of mock test
    formData.append("file", new Blob(["test content"]), "test.txt");

    const response = await httpBin.upload(new URL("/post", "https://httpbin.org"), formData);
    
    expect(response?.status).toBe(200);
    expect(response?.data.files).toHaveProperty("file");
  });
});
