/**
 *
 * Certificate
 *
 */

import React, { memo } from "react";
import moment from "moment";
import logo from '../../images/logo.jpg';
import signs from '../../images/signs.jpg';
import { Document, Font, Page, View, Text, Image, StyleSheet, PDFViewer } from '@react-pdf/renderer';
import GilroyExtraBold from "../../fonts/Gilroy-ExtraBold.ttf";
import GilroyBold from "../../fonts/Gilroy-Bold.ttf";
import GilroySemiBold from "../../fonts/Gilroy-SemiBold.ttf";
import GilroyMedium from "../../fonts/Gilroy-Medium.ttf";
import GilroyRegular from "../../fonts/Gilroy-Regular.ttf";

function Certificate({quotationDetails}) {
  Font.register({
    family: 'Gilroy', fonts: [
      { src: GilroyExtraBold, fontWeight: 900 },
      { src: GilroyBold, fontWeight: 700 },
      { src: GilroySemiBold, fontWeight: 600 },
      { src: GilroyMedium, fontWeight: 500 },
      { src: GilroyRegular, fontWeight: 400 },
    ]
  });

  const styles = StyleSheet.create({
    body: {
      paddingTop: 20,
      paddingBottom: 20,
      paddingHorizontal: 40,
      fontSize: 10,
      fontFamily: 'Gilroy',
      fontWeight: 600,
      letterSpacing: 0.2
    },
    fontSize10: {
      fontSize: 10
    },
    fontSize12: {
      fontSize: 12
    },
    fontSize20: {
      fontSize: 20
    },
    fontWeight700: {
      fontWeight: 700
    },
    textAlignCenter: {
      textAlign: 'center'
    },
    textAlignRight: {
      textAlign: 'right'
    },
    marginTop7: {
      marginTop: 7
    },
    marginTop10: {
      marginTop: 10
    },
    marginTop20: {
      marginTop: 20
    },
    marginTop25: {
      marginTop: 25
    },
    marginTop35: {
      marginTop: 35
    },
    marginTop50: {
      marginTop: 50
    },
    border: {
      border: '1px solid #f72485',
    },
    lineHeight1: {
      lineHeight: 1.5,
    },
    padding8: {
      padding: 8,
    },
    padding25: {
      padding: 25
    },
    paddingLeft: {
      paddingLeft: 15
    },
    flex: {
      flexBasis: 1,
      flexDirection: "column",
      alignSelf: "stretch",
      flexShrink: 0
    },
    flex: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center'
    },
    flex2: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    logo: {
      width: 60,
      margin: "0 auto",
      backgroundRepeat: 'no-repeat'
    },
    title: {
      textAlign: "center"
    },
    orangeColor: {
      color: "#f72485"
    },
    leftSide: {
      width: "50%"
    },
    rightSide: {
      width: "50%"
    },
    uppercase: {
      textTransform: "uppercase"
    }

  });
  return (
    <PDFViewer>
       <Document>
         <Page size="A4" style={styles.body}>
           <View style={[styles.header]}>
             <Image source={{ uri: logo }} style={styles.logo} />
           </View>
           <Text style={[styles.fontSize20, styles.fontWeight700, styles.marginTop10, styles.textAlignCenter, styles.orangeColor]}>Certificate Of Insurance</Text>

           <Text style={[styles.textAlignRight, styles.marginTop35]}>W. A. Z300</Text>
              <View style={[styles.flex2, styles.marginTop7]}>
                <Text style={[styles.leftSide]}>Certificate No : <Text style={[styles.fontWeight700, styles.uppercase]}>{quotationDetails?.value?.CERTIFICATE_NUMBER}</Text></Text>
                <Text style={[styles.rightSide]}>Policy No. : <Text style={[styles.fontWeight700, styles.uppercase]}>{quotationDetails?.value?.POLICY_NUMBER}</Text></Text>
              </View>

              <View style={[styles.flex2, styles.marginTop10]}>
                <Text style={[styles.leftSide]}>1. Device Serial Number :</Text>
                <Text style={[styles.rightSide, styles.fontWeight700, styles.uppercase]}>{quotationDetails?.value?.DEVICE_SERIAL_NUMBER} </Text>
              </View>
              <View style={[styles.flex2, styles.marginTop10]}>
                <Text style={[styles.leftSide]}>2. Device Type :</Text>
                <Text style={[styles.rightSide, styles.fontWeight700, styles.uppercase]}>{quotationDetails?.value?.DEVICE_TYPE}</Text>
              </View>
              <View style={[styles.flex2, styles.marginTop10]}>
                <Text style={[styles.leftSide]}>3. Device Make :</Text>
                <Text style={[styles.rightSide, styles.fontWeight700, styles.uppercase]}>{quotationDetails?.value?.DEVICE_MAKE}</Text>
              </View>
              <View style={[styles.flex2, styles.marginTop10]}>
                <Text style={[styles.leftSide]}>4. Device Model :</Text>
                <Text style={[styles.rightSide, styles.fontWeight700, styles.uppercase]}>{quotationDetails?.value?.DEVICE_MODAL}</Text>
              </View>
              <View style={[styles.flex2, styles.marginTop10]}>
                <Text style={[styles.leftSide]}>5. Name of Policy Holder :</Text>
                <Text style={[styles.rightSide, styles.fontWeight700, styles.uppercase]}>{quotationDetails?.value?.FIRST_NAME + " " + quotationDetails?.value?.LAST_NAME}</Text>
              </View>
              <View style={[styles.flex2, styles.marginTop10]}>
                <Text style={[styles.leftSide]}>6. Commencement of Insurance :</Text>
                <Text style={[styles.rightSide, styles.fontWeight700, styles.uppercase]}>{moment(quotationDetails?.value?.Valid_From).format("DD-MM-YYYY")}</Text>
              </View>
              <View style={[styles.flex2, styles.marginTop10]}>
                <Text style={[styles.leftSide]}>7. Date of Expiry of Insurance :</Text>
                <Text style={[styles.rightSide, styles.fontWeight700, styles.uppercase]}>{moment(quotationDetails?.value?.Valid_To).format("DD-MM-YYYY")} </Text>
              </View>

              <View style={[styles.marginTop10]}>
                <Text>8. Persons or classes of persons entitled to use: </Text>
                <Text style={[styles.paddingLeft, styles.marginTop7]}>(a) The Policy holder</Text>
                <Text style={[styles.paddingLeft, styles.marginTop7, styles.lineHeight1]}>Any other person who is using on the Policy holder's order or with his permission.</Text>
              </View>

              <View style={[styles.marginTop10]}>
                <Text>9. Limitations as to use: </Text>
                <Text style={[styles.paddingLeft, styles.marginTop7, styles.lineHeight1]}>Use in connection with the Policy holder's business.</Text>
                <Text style={[styles.paddingLeft, styles.marginTop7, styles.lineHeight1]}>The Policy does not cover</Text>
                <Text style={[styles.paddingLeft, styles.marginTop7, styles.lineHeight1]}>(1) If device is stolen from an unoccupied premises, unless there is evidence of violent and forcible entry to the premises.</Text>
                <Text style={[styles.paddingLeft, styles.marginTop7, styles.lineHeight1]}>(2) Any claim that arises while your device is in the possession of anyone other than you or a staff member of your organisation.</Text>
                <Text style={[styles.paddingLeft, styles.lineHeight1, styles.marginTop25]}>I/We hereby Certify that the Policy to which this Certificate relates is issued in accordance with the law.</Text>
              </View>

              {/* <View style={[styles.marginTop50]}>
                <Image source={{ uri: signs }} />
              </View> */}
         </Page>
       </Document>
     </PDFViewer>
  );
}

Certificate.propTypes = {};

export default memo(Certificate);
