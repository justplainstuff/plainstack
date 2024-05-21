export function SignupSection() {
  return (
    <div class="mx-auto max-w-4xl pb-24 py-10 sm:pb-32 px-8">
      <h2 class="text-4xl font-bold tracking-tight text-neutral">
        Stay updated
      </h2>
      <p class="text-neutral mt-4">
        Plainweb is work in progress, get notified about updates. No spam,
        promise.
      </p>
      <form class="join mt-6" hx-post="/" hx-swap="outerHTML">
        <input
          name="email"
          type="email"
          class="input input-bordered join-item"
          placeholder="Email"
        />
        <button type="submit" class="btn btn-primary join-item">
          Sign up
        </button>
      </form>
    </div>
  );
}
