import { BellAlertIcon, CheckIcon } from '@heroicons/react/24/outline';
import { State } from '../lib/actions';

export async function FormSubmissionState({ state }: { state: State }) {
  return (
    <>
      {state.message && (
        <div
          className={` ${
            state.success
              ? 'border-1 border-green-300 bg-green-100 text-green-600'
              : 'border-1 border-red-300 bg-red-100 text-red-600'
          } mt-2 flex items-center gap-3 rounded-md p-4 text-xs font-bold`}
        >
          {state.success ? (
            <CheckIcon className="h-4 w-4" />
          ) : (
            <BellAlertIcon className="h-4 w-4" />
          )}
          <div>{state.message}</div>
        </div>
      )}
    </>
  );
}
