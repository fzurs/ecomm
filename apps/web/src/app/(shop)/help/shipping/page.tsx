import type { Province } from "@workspace/api-client"
import { getShippingOptions } from "@/lib/cache"
import { formatPrice } from "@/lib/format"
import { provinces } from "@/lib/shipping"

export const metadata = { title: "Shipping" }

/** The zones and their costs, as the checkout charges them. */
export default async function ShippingPage() {
  const { zones, pickup_address } = await getShippingOptions()
  const names = (codes: Province[]) =>
    codes
      .map((code) => provinces[code])
      .sort((a, b) => a.localeCompare(b, "es"))
      .join(", ")

  return (
    <div className="typeset mx-auto w-full max-w-3xl">
      <h1>Shipping</h1>
      <p>
        We ship all over the country with a carrier. What it costs depends on
        the province, and you see it at checkout before paying. Once your order
        ships we email you the carrier and the tracking number.
      </p>
      {zones.length ? (
        <table>
          <thead>
            <tr>
              <th>Zone</th>
              <th>Cost</th>
              <th>Free from</th>
            </tr>
          </thead>
          <tbody>
            {zones.map((zone) => (
              <tr key={zone.id}>
                <td>
                  <strong>{zone.name}</strong>
                  <br />
                  <small>{names(zone.provinces)}</small>
                </td>
                <td>{formatPrice(zone.cost)}</td>
                <td>
                  {zone.free_from != null ? formatPrice(zone.free_from) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>We aren&apos;t shipping orders right now.</p>
      )}
      {pickup_address && (
        <>
          <h2>Pick it up</h2>
          <p>
            You can also pick your order up for free at {pickup_address}. Choose
            it at checkout; we email you when it&apos;s ready.
          </p>
        </>
      )}
      <h2>Delivery times</h2>
      <p>
        Orders ship within 2 business days of the payment. The carrier then
        takes 2 to 7 business days, depending on the destination.
      </p>
    </div>
  )
}
