import React from 'react'

export const PricingTable = () => (
  <>
    <table className="min-w-full border-collapse table-auto border border-neutral-200">
      <thead className="bg-neutral-100">
        <tr className="font-semibold text-neutral-600 text-left">
          <th className="py-2 px-4 border-b">Voice</th>
          <th className="py-2 px-4 border-b">Cost per character</th>
          <th className="py-2 px-4 border-b">Approximates to</th>
        </tr>
      </thead>
      <tbody>
        <tr className="even:bg-neutral-50">
          <td className="py-2 px-4 border-b">Standard</td>
          <td className="py-2 px-4 border-b">$0.000016</td>
          <td className="py-2 px-4 border-b">6000 sentences</td>
        </tr>
        <tr className="even:bg-neutral-50">
          <td className="py-2 px-4 border-b">Wavenet</td>
          <td className="py-2 px-4 border-b">$0.000048</td>
          <td className="py-2 px-4 border-b">2000 sentences</td>
        </tr>
        <tr className="even:bg-neutral-50">
          <td className="py-2 px-4 border-b">Polyglot</td>
          <td className="py-2 px-4 border-b">$0.000048</td>
          <td className="py-2 px-4 border-b">2000 sentences</td>
        </tr>
        <tr className="even:bg-neutral-50">
          <td className="py-2 px-4 border-b">Neural2</td>
          <td className="py-2 px-4 border-b">$0.000048</td>
          <td className="py-2 px-4 border-b">2000 sentences</td>
        </tr>
        <tr className="even:bg-neutral-50">
          <td className="py-2 px-4 border-b">News</td>
          <td className="py-2 px-4 border-b">$0.000048</td>
          <td className="py-2 px-4 border-b">2000 sentences</td>
        </tr>
        <tr className="even:bg-neutral-50">
          <td className="py-2 px-4 border-b">Studio</td>
          <td className="py-2 px-4 border-b">$0.00024</td>
          <td className="py-2 px-4 border-b">400 sentences</td>
        </tr>
      </tbody>
    </table>
  </>
)
