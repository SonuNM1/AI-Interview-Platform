export function Dashboard() {
  return (
    <div className="p-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-4 gap-4">
          <div className="h-32 rounded-xl bg-red-500 p-4">
            ONE
          </div>

          <div className="h-32 rounded-xl bg-blue-500 p-4">
            TWO
          </div>

          <div className="h-32 rounded-xl bg-green-500 p-4">
            THREE
          </div>

          <div className="h-32 rounded-xl bg-purple-500 p-4">
            FOUR
          </div>
        </div>
      </div>
    </div>
  );
}