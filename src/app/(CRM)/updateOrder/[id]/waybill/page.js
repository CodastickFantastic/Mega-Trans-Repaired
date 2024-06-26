"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import QRCode from "react-qr-code";
import Image from "next/image";
import Logo from "@/images/LogoBlack.png";

import { generateWaybill } from "@/helpers/generatePdf";

import { useSession } from "next-auth/react";

import { Parser } from "html-to-react";

export default function Waybill() {
  const ref = useRef();
  const pathname = usePathname();
  const id = pathname.split("/")[2];

  const { data: session } = useSession();
  const [orderData, setOrderData] = useState({
    id: "",
    sender: "",
    packagesNumber: "",
    orderType: "",
    recipient: "",
    recipientPhone: "",
    price: "",
    address: "",
    city: "",
    orderNote: "",
    currency: "",
    senderPhone: "",
  });

  const [packages, setPackages] = useState([]);
  const [pageRender, setPageRender] = useState(0);

  useEffect(() => {
    if (session && pageRender === 0) {
      getOrder();
      setPageRender(1);
    }
  }, [session]);

  if (orderData.id !== "" && pageRender === 1) {
    generateWaybill(ref);
    setPageRender(2);
  }

  // Get order from API
  async function getOrder() {
    const req = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/api/order/getOrder?id=${id}`, {
      method: "GET",
      headers: {
        Authorization: session?.accessToken,
      },
    });
    const res = await req.json();

    if (res.error) {
      console.log(res.error);
    } else if (res.order) {
      let address = res.order.orderStreet + " " + res.order.orderStreetNumber;
      if (res.order.orderFlatNumber) address += "/" + res.order.orderFlatNumber;

      setOrderData({
        id: res.order.orderId,
        sender: Parser().parse(res.order.user.company),
        packagesNumber: res.order.packages.length,
        orderType: res.order.orderType,
        recipient: Parser().parse(res.order.recipientName),
        recipientPhone: res.order.recipientPhone.replace(/^(.{3})(.{3})(.*)$/, "$1 $2 $3"),
        price: res.order.orderPaymentType === "Pobranie" ? res.order.orderPrice + res.order.currency : "Opłacone",
        address: Parser().parse(address),
        city: res.order.orderPostCode + " " + res.order.orderCity,
        orderNote: Parser().parse(res.order.orderNote),
        currency: res.order.currency,
        senderPhone: res.order.user.phone,
      });
      setPackages(
        res.order.packages.map((item, index) => {
          return (
            <div className="package" key={item.packageId}>
              <div className="row">
                <p className="number">{index + 1}</p>
                <p className="id">{item.packageId}</p>
                <p className="name">{Parser().parse(item.commodityName)}</p>
              </div>
            </div>
          );
        })
      );
    }
  }

  return (
    <div className="Waybill" ref={ref}>
      <header>
        <Image src={Logo} alt="Logo" priority />
        <div className="row">
          <div className="left">
            <h1>Podstawowe Informacje</h1>
            <p>
              Nadawca: <span>{orderData.sender}</span>
            </p>
            <p>
              Telefon Nadawcy: <span>{orderData.senderPhone.replace(/^(.{3})(.{3})(.*)$/, "$1 $2 $3")}</span>
            </p>
            <p>
              Zlecenie: <span>{orderData.id}</span>
            </p>
            <p>
              Ilość Paczek: <span>{orderData.packagesNumber}</span>
            </p>
          </div>
          <div className="right">
            <QRCode value={id} size={140} />
          </div>
        </div>
      </header>

      <main>
        <h2>Informacje o Przesyłce</h2>
        <div className="row">
          <p className="type">
            Rodzaj transportu: <span>{orderData.orderType}</span>
          </p>
          <p className="name">
            Nazwa Odbiorcy: <span>{orderData.recipient}</span>
          </p>
          <p className="phone">
            Numer Telefonu: <span>{orderData.recipientPhone}</span>
          </p>
        </div>
        <div className="row">
          <p className="price">
            Płatność: <span>{orderData.price}</span>
          </p>
          <p className="address">
            Adres: <span>{orderData.address}</span>
          </p>
          <p className="city">
            Miejscowość: <span>{orderData.city}</span>
          </p>
        </div>
        {orderData.orderNote && (
          <div className="row">
            <p>
              Dodatkowe Informacje: <span>{orderData.orderNote}</span>
            </p>
          </div>
        )}

        <h2 className="packagesDivider">Wykaz Paczek</h2>

        <div className="packages">{packages}</div>
      </main>
      <footer>
        <p className="info">
          Ze względu na umówione godziny dostaw, a także wydajność kierowców, zakupiony przez Państwa towar należy wnieść we własnym
          zakresie. Kierwoca nie ma obowiązku wnoszenia mebli do domu/mieszkania.
          <br />
          <br />
          Sprawdź towar w obecności kierowcy. <br />
          <br />
          Potwierdzam odbiór dostarczonego, nieuszkodzonego produktu. Towar jest kompletny, zgodny z zamówieniem, pozbawiony zniszczeń i
          wad.
        </p>
        <div className="confirmation">
          <p className="date">Data odbioru</p>
          <p className="time">Godzina odbioru</p>
          <p className="signature">Podpis odbiorcy</p>
        </div>
      </footer>
    </div>
  );
}
