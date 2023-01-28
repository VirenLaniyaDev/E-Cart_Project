const pdfKit = require('pdfkit');

// let companyLogo = "./images/companyLogo.png";
let fontNormal = 'Helvetica';
let fontBold = 'Helvetica-Bold';

exports.createPDF = function createPdf(order, seller) {
    try {

        let pdfDoc = new pdfKit();

        // For create file
        // let stream = fs.createWriteStream(fileName);
        // pdfDoc.pipe(stream);

        // pdfDoc.image(companyLogo, 25, 20, { width: 50, height: 50 });
        pdfDoc.font(fontBold).fontSize(14).text('E-Cart', 30, 75);
        pdfDoc.font(fontNormal).fontSize(14).text('Order Invoice/Bill Receipt', 400, 30, { width: 200 });
        pdfDoc.fontSize(10).text(getDate_Invoice(new Date()), 400, 46, { width: 200 });

        pdfDoc.font(fontBold).text("Sold by:", 30, 100);
        pdfDoc.font(fontNormal).text(order.seller.business_name, 30, 115, { width: 250 });
        pdfDoc.text(`GSTIN : ${seller.business_GSTIN ? seller.business_GSTIN : '-'}`, 30, 130, { width: 250 });
        pdfDoc.text(`${seller.business_address ? seller.business_address : ''}`, 30, 142, { width: 250 });

        pdfDoc.font(fontBold).text("Ship to:", 400, 100);
        pdfDoc.font(fontNormal).text(order.user.name, 400, 115, { width: 250 });
        pdfDoc.text(order.user.delivery_address, 400, 130, { width: 250 });

        pdfDoc.text("Order # " + order._id.toString(), 30, 195, { width: 250 });
        pdfDoc.text("Order Date:" + getDate_Invoice(order.createdAt), 30, 210, { width: 250 });
        pdfDoc.text("Invoice Date:" + getDate_Invoice(order.delivery_on), 30, 225, { width: 250 });

        pdfDoc.rect(20, 250, 560, 20).fill("#06283D").stroke("#06283D");
        pdfDoc.fillColor("#fff").text("Product", 30, 256, { width: 250 });
        pdfDoc.text("Qty", 350, 256, { width: 100 });
        pdfDoc.text("Price(Rupee)", 400, 256, { width: 100 });
        pdfDoc.text(`Total Price(Rupee)`, 500, 256, { width: 100 });

        let productNo = 1;
        let y = 256 + (productNo * 20);
        pdfDoc.fillColor("#000").text(order.product.title.substring(0, 150), 30, y, { width: 260 });
        pdfDoc.text(order.product.ordered_quantity, 350, y, { width: 100 });
        pdfDoc.text(order.product.sellingPrice, 400, y, { width: 100 });
        pdfDoc.text(order.orderAmount.priceAmount, 500, y, { width: 100 });

        // Shipping Charges
        productNo++;
        y = y + 40;
        pdfDoc.fillColor("#000").text("Shipping Charge", 30, y, { width: 250 });
        pdfDoc.text(1, 350, y, { width: 100 });
        pdfDoc.text(order.orderAmount.deliveryCharges, 400, y, { width: 100 });
        pdfDoc.text(order.orderAmount.deliveryCharges, 500, y, { width: 100 });

        // Secured packaging Fees
        productNo++;
        y = y + 20;
        pdfDoc.fillColor("#000").text("Secured packaging Fee", 30, y, { width: 250 });
        pdfDoc.text(1, 350, y, { width: 100 });
        pdfDoc.text(order.orderAmount.packagingFee, 400, y, { width: 100 });
        pdfDoc.text(order.orderAmount.packagingFee, 500, y, { width: 100 });

        // Separator
        productNo++;
        y = y + 20;
        pdfDoc.rect(20, y, 560, 0.2).fillColor("#000").stroke("#000");

        pdfDoc.font(fontBold).text("Total:", 400, y + 10);
        pdfDoc.font(fontBold).text(order.orderAmount.totalAmount, 500, y + 10);

        return pdfDoc;
    } catch (error) {
        console.log("Error occurred", error);
    }
}

function getDate_Invoice(date) {
    return date.toLocaleString('en-US', { timeZone: 'Asia/Calcutta' })
}