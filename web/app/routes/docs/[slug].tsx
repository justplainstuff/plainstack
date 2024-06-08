import { Handler, notFound } from "plainweb";
import Layout from "~/app/layout";
import { getDocumentationPages } from "~/app/services/documentation";

export const GET: Handler = async ({ req }) => {
  const pages = await getDocumentationPages();
  const currentPage = pages.find((page) => page.slug === req.params.slug);
  if (!currentPage) return notFound();
  const safeContent = currentPage.content;
  return (
    <Layout title={currentPage.title}>
      <div class="max-w-5xl mx-auto">
        <div role="alert" class="alert alert-warning my-8">
          <span>plainweb is work in progress, APIs are subject to change!</span>
        </div>
        <div class="flex flex-col sm:flex-row mt-4 mb-24">
          <div class="flex justify-around items-start">
            <ul class="menu bg-base-200 w-56 rounded-box mb-8 sm:mb-0">
              {pages.map((page) => (
                <li>
                  <a
                    safe
                    preload
                    href={`/docs/${page.slug}`}
                    class={page.slug === currentPage.slug ? "active" : ""}
                  >
                    {page.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div class="px-3 pl-3 md:pl-20 md:px-0 prose">{safeContent}</div>
        </div>
      </div>
    </Layout>
  );
};
