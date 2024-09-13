export async function ShippingSection() {
  return (
    <div class="mx-auto max-w-6xl pb-24 py-10 sm:pb-48 px-4 md:px-8 text-base-content">
      <h2 class="text-5xl md:text-6xl font-bold tracking-tight text-center">
        Recipe For Shipping Fast
      </h2>
      <p class="text-3xl font-bold text-center mt-6 text-base-content/70">
        Doing things plain and simple is key...
      </p>
      <div class="flex flex-col md:justify-between md:flex-row md:space-x-12 mt-20">
        <div class="mb-8 md:mb-0 flex-1">
          <div class="text-lg">
            <p>...especially early-on in a project.</p>
            <br />
            <p>This means, among other things:</p>
            <ul class="list-disc list-inside mt-4">
              <li>A single long-running process</li>
              <li>Using SQLite</li>
              <li>Deploying to a VPS</li>
              <li>Having full end-to-end type-safety</li>
            </ul>
            <p class="mt-4">This is the spirit of plainstack.</p>
          </div>
        </div>
        <div class="md:flex-1 max-w-[400px]">
          <div class="text-3xl md:text-4xl font-semibold space-y-2">
            <div>You 🫵</div>
            <div>+ plain & simple code</div>
            <div>+ SQLite</div>
            <div>+ a VPS</div>
            <div class="border-t border-base-content mt-2 pt-2">
              = shipping fast 🚢
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
