const express = require("express");
const app = express();
const server = require("http").Server(app);
const port = 3000;

const { createCanvas } = require("canvas");

app.get("/", (req, res) => {
  for (const key in req.query) {
    console.log(key, req.query[key]);
  }
  // Required
  var fullNameTo = req.query.fullNameTo;
  var streetAndNumberTo = req.query.streetAndNumberTo;
  var postalAndCityTo = req.query.postalAndCityTo;
  var modelTo = req.query.modelTo;
  var numberTo = req.query.numberTo;
  var ibanTo = req.query.ibanTo;
  var amount = req.query.amount;

  // Can default
  var currency = req.query.currency === undefined ? "HRK" : req.query.currency;
  var code = req.query.code === undefined ? "COST" : req.query.code;
  var description =
    req.query.description === undefined ? "Plaćanje" : req.query.description;
  var header = req.query.header === undefined ? "HRVHUB30" : req.query.header;

  // Optional
  var fullNameFrom =
    req.query.fullNameFrom === undefined ? "" : req.query.fullNameFrom;
  var streetAndNumberFrom =
    req.query.streetAndNumberFrom === undefined
      ? ""
      : req.query.streetAndNumberFrom;
  var postalAndCityFrom =
    req.query.postalAndCityFrom === undefined
      ? ""
      : req.query.postalAndCityFrom;

  var hub3_code =
    header +
    "\n" +
    currency +
    "\n" +
    amount +
    "\n" +
    fullNameFrom +
    "\n" +
    streetAndNumberFrom +
    "\n" +
    postalAndCityFrom +
    "\n" +
    fullNameTo +
    "\n" +
    streetAndNumberTo +
    "\n" +
    postalAndCityTo +
    "\n" +
    ibanTo +
    "\n" +
    modelTo +
    "\n" +
    numberTo +
    "\n" +
    code +
    "\n" +
    description +
    "\n";

  PDF417.init(hub3_code);

  var barcode = PDF417.getBarcodeArray();

  //block sizes (width and height) in pixels
  var bw = 2;
  var bh = 2;

  const canvas = createCanvas(
    bw * barcode["num_cols"],
    bh * barcode["num_rows"]
  );
  const ctx = canvas.getContext("2d");

  // graph barcode elements
  var y = 0;
  // for each row
  for (var r = 0; r < barcode["num_rows"]; ++r) {
    var x = 0;
    // for each column
    for (var c = 0; c < barcode["num_cols"]; ++c) {
      if (barcode["bcode"][r][c] == 1) {
        ctx.fillRect(x, y, bw, bh);
      }
      x += bw;
    }
    y += bh;
  }

  res.setHeader("Access-Control-Allow-Origin", "*");
  //var canvasString = new Buffer(canvas.createJPEGStream()).toString("base64");
  res.status(200);
  //res.json({ barcode: barcode });
  res.send(canvas.toDataURL());
  res.end();
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, (err) => {
  if (err) {
    throw err;
  }
  /* eslint-disable no-console */
  console.log("Node Endpoints working :)");
});

module.exports = server;

/**
 * PDF417 - 2D Barcode generator (LGPLv3)
 *
 * Ported from PHP - PDF417 class, version 1.0.005, from TCPDF library (http://www.tcpdf.org/)
 */
var PDF417 = {
  ROWHEIGHT: 4,
  QUIETH: 2,
  QUIETV: 2,

  barcode_array: {},
  start_pattern: "11111111010101000",
  stop_pattern: "111111101000101001",

  /**
   * Array of text Compaction Sub-Modes (values 0xFB - 0xFF are used for submode changers).
   */
  textsubmodes: [
    [
      0x41,
      0x42,
      0x43,
      0x44,
      0x45,
      0x46,
      0x47,
      0x48,
      0x49,
      0x4a,
      0x4b,
      0x4c,
      0x4d,
      0x4e,
      0x4f,
      0x50,
      0x51,
      0x52,
      0x53,
      0x54,
      0x55,
      0x56,
      0x57,
      0x58,
      0x59,
      0x5a,
      0x20,
      0xfd,
      0xfe,
      0xff,
    ], // Alpha
    [
      0x61,
      0x62,
      0x63,
      0x64,
      0x65,
      0x66,
      0x67,
      0x68,
      0x69,
      0x6a,
      0x6b,
      0x6c,
      0x6d,
      0x6e,
      0x6f,
      0x70,
      0x71,
      0x72,
      0x73,
      0x74,
      0x75,
      0x76,
      0x77,
      0x78,
      0x79,
      0x7a,
      0x20,
      0xfd,
      0xfe,
      0xff,
    ], // Lower
    [
      0x30,
      0x31,
      0x32,
      0x33,
      0x34,
      0x35,
      0x36,
      0x37,
      0x38,
      0x39,
      0x26,
      0x0d,
      0x09,
      0x2c,
      0x3a,
      0x23,
      0x2d,
      0x2e,
      0x24,
      0x2f,
      0x2b,
      0x25,
      0x2a,
      0x3d,
      0x5e,
      0xfb,
      0x20,
      0xfd,
      0xfe,
      0xff,
    ], // Mixed
    [
      0x3b,
      0x3c,
      0x3e,
      0x40,
      0x5b,
      0x5c,
      0x5d,
      0x5f,
      0x60,
      0x7e,
      0x21,
      0x0d,
      0x09,
      0x2c,
      0x3a,
      0x0a,
      0x2d,
      0x2e,
      0x24,
      0x2f,
      0x22,
      0x7c,
      0x2a,
      0x28,
      0x29,
      0x3f,
      0x7b,
      0x7d,
      0x27,
      0xff,
    ], // Puntuaction
  ],

  /**
   * Array of switching codes for Text Compaction Sub-Modes.
   */
  textlatch: {
    "01": [27],
    "02": [28],
    "03": [28, 25], //
    "10": [28, 28],
    "12": [28],
    "13": [28, 25], //
    "20": [28],
    "21": [27],
    "23": [25], //
    "30": [29],
    "31": [29, 27],
    "32": [29, 28], //
  },

  /**
   * Clusters of codewords (0, 3, 6)<br/>
   * Values are hex equivalents of binary representation of bars (1 = bar, 0 = space).<br/>
   * The codewords numbered from 900 to 928 have special meaning, some enable to switch between modes in order to optimise the code:
   * <ul>
   * <li>900 : Switch to "Text" mode</li>
   * <li>901 : Switch to "Byte" mode</li>
   * <li>902 : Switch to "Numeric" mode</li>
   * <li>903 - 912 : Reserved</li>
   * <li>913 : Switch to "Octet" only for the next codeword</li>
   * <li>914 - 920 : Reserved</li>
   * <li>921 : Initialization</li>
   * <li>922 : Terminator codeword for Macro PDF control block</li>
   * <li>923 : Sequence tag to identify the beginning of optional fields in the Macro PDF control block</li>
   * <li>924 : Switch to "Byte" mode (If the total number of byte is multiple of 6)</li>
   * <li>925 : Identifier for a user defined Extended Channel Interpretation (ECI)</li>
   * <li>926 : Identifier for a general purpose ECI format</li>
   * <li>927 : Identifier for an ECI of a character set or code page</li>
   * <li>928 : Macro marker codeword to indicate the beginning of a Macro PDF Control Block</li>
   * </ul>
   */
  clusters: [
    [
      // cluster 0 -----------------------------------------------------------------------
      0x1d5c0,
      0x1eaf0,
      0x1f57c,
      0x1d4e0,
      0x1ea78,
      0x1f53e,
      0x1a8c0,
      0x1d470,
      0x1a860,
      0x15040, //  10
      0x1a830,
      0x15020,
      0x1adc0,
      0x1d6f0,
      0x1eb7c,
      0x1ace0,
      0x1d678,
      0x1eb3e,
      0x158c0,
      0x1ac70, //  20
      0x15860,
      0x15dc0,
      0x1aef0,
      0x1d77c,
      0x15ce0,
      0x1ae78,
      0x1d73e,
      0x15c70,
      0x1ae3c,
      0x15ef0, //  30
      0x1af7c,
      0x15e78,
      0x1af3e,
      0x15f7c,
      0x1f5fa,
      0x1d2e0,
      0x1e978,
      0x1f4be,
      0x1a4c0,
      0x1d270, //  40
      0x1e93c,
      0x1a460,
      0x1d238,
      0x14840,
      0x1a430,
      0x1d21c,
      0x14820,
      0x1a418,
      0x14810,
      0x1a6e0, //  50
      0x1d378,
      0x1e9be,
      0x14cc0,
      0x1a670,
      0x1d33c,
      0x14c60,
      0x1a638,
      0x1d31e,
      0x14c30,
      0x1a61c, //  60
      0x14ee0,
      0x1a778,
      0x1d3be,
      0x14e70,
      0x1a73c,
      0x14e38,
      0x1a71e,
      0x14f78,
      0x1a7be,
      0x14f3c, //  70
      0x14f1e,
      0x1a2c0,
      0x1d170,
      0x1e8bc,
      0x1a260,
      0x1d138,
      0x1e89e,
      0x14440,
      0x1a230,
      0x1d11c, //  80
      0x14420,
      0x1a218,
      0x14410,
      0x14408,
      0x146c0,
      0x1a370,
      0x1d1bc,
      0x14660,
      0x1a338,
      0x1d19e, //  90
      0x14630,
      0x1a31c,
      0x14618,
      0x1460c,
      0x14770,
      0x1a3bc,
      0x14738,
      0x1a39e,
      0x1471c,
      0x147bc, // 100
      0x1a160,
      0x1d0b8,
      0x1e85e,
      0x14240,
      0x1a130,
      0x1d09c,
      0x14220,
      0x1a118,
      0x1d08e,
      0x14210, // 110
      0x1a10c,
      0x14208,
      0x1a106,
      0x14360,
      0x1a1b8,
      0x1d0de,
      0x14330,
      0x1a19c,
      0x14318,
      0x1a18e, // 120
      0x1430c,
      0x14306,
      0x1a1de,
      0x1438e,
      0x14140,
      0x1a0b0,
      0x1d05c,
      0x14120,
      0x1a098,
      0x1d04e, // 130
      0x14110,
      0x1a08c,
      0x14108,
      0x1a086,
      0x14104,
      0x141b0,
      0x14198,
      0x1418c,
      0x140a0,
      0x1d02e, // 140
      0x1a04c,
      0x1a046,
      0x14082,
      0x1cae0,
      0x1e578,
      0x1f2be,
      0x194c0,
      0x1ca70,
      0x1e53c,
      0x19460, // 150
      0x1ca38,
      0x1e51e,
      0x12840,
      0x19430,
      0x12820,
      0x196e0,
      0x1cb78,
      0x1e5be,
      0x12cc0,
      0x19670, // 160
      0x1cb3c,
      0x12c60,
      0x19638,
      0x12c30,
      0x12c18,
      0x12ee0,
      0x19778,
      0x1cbbe,
      0x12e70,
      0x1973c, // 170
      0x12e38,
      0x12e1c,
      0x12f78,
      0x197be,
      0x12f3c,
      0x12fbe,
      0x1dac0,
      0x1ed70,
      0x1f6bc,
      0x1da60, // 180
      0x1ed38,
      0x1f69e,
      0x1b440,
      0x1da30,
      0x1ed1c,
      0x1b420,
      0x1da18,
      0x1ed0e,
      0x1b410,
      0x1da0c, // 190
      0x192c0,
      0x1c970,
      0x1e4bc,
      0x1b6c0,
      0x19260,
      0x1c938,
      0x1e49e,
      0x1b660,
      0x1db38,
      0x1ed9e, // 200
      0x16c40,
      0x12420,
      0x19218,
      0x1c90e,
      0x16c20,
      0x1b618,
      0x16c10,
      0x126c0,
      0x19370,
      0x1c9bc, // 210
      0x16ec0,
      0x12660,
      0x19338,
      0x1c99e,
      0x16e60,
      0x1b738,
      0x1db9e,
      0x16e30,
      0x12618,
      0x16e18, // 220
      0x12770,
      0x193bc,
      0x16f70,
      0x12738,
      0x1939e,
      0x16f38,
      0x1b79e,
      0x16f1c,
      0x127bc,
      0x16fbc, // 230
      0x1279e,
      0x16f9e,
      0x1d960,
      0x1ecb8,
      0x1f65e,
      0x1b240,
      0x1d930,
      0x1ec9c,
      0x1b220,
      0x1d918, // 240
      0x1ec8e,
      0x1b210,
      0x1d90c,
      0x1b208,
      0x1b204,
      0x19160,
      0x1c8b8,
      0x1e45e,
      0x1b360,
      0x19130, // 250
      0x1c89c,
      0x16640,
      0x12220,
      0x1d99c,
      0x1c88e,
      0x16620,
      0x12210,
      0x1910c,
      0x16610,
      0x1b30c, // 260
      0x19106,
      0x12204,
      0x12360,
      0x191b8,
      0x1c8de,
      0x16760,
      0x12330,
      0x1919c,
      0x16730,
      0x1b39c, // 270
      0x1918e,
      0x16718,
      0x1230c,
      0x12306,
      0x123b8,
      0x191de,
      0x167b8,
      0x1239c,
      0x1679c,
      0x1238e, // 280
      0x1678e,
      0x167de,
      0x1b140,
      0x1d8b0,
      0x1ec5c,
      0x1b120,
      0x1d898,
      0x1ec4e,
      0x1b110,
      0x1d88c, // 290
      0x1b108,
      0x1d886,
      0x1b104,
      0x1b102,
      0x12140,
      0x190b0,
      0x1c85c,
      0x16340,
      0x12120,
      0x19098, // 300
      0x1c84e,
      0x16320,
      0x1b198,
      0x1d8ce,
      0x16310,
      0x12108,
      0x19086,
      0x16308,
      0x1b186,
      0x16304, // 310
      0x121b0,
      0x190dc,
      0x163b0,
      0x12198,
      0x190ce,
      0x16398,
      0x1b1ce,
      0x1638c,
      0x12186,
      0x16386, // 320
      0x163dc,
      0x163ce,
      0x1b0a0,
      0x1d858,
      0x1ec2e,
      0x1b090,
      0x1d84c,
      0x1b088,
      0x1d846,
      0x1b084, // 330
      0x1b082,
      0x120a0,
      0x19058,
      0x1c82e,
      0x161a0,
      0x12090,
      0x1904c,
      0x16190,
      0x1b0cc,
      0x19046, // 340
      0x16188,
      0x12084,
      0x16184,
      0x12082,
      0x120d8,
      0x161d8,
      0x161cc,
      0x161c6,
      0x1d82c,
      0x1d826, // 350
      0x1b042,
      0x1902c,
      0x12048,
      0x160c8,
      0x160c4,
      0x160c2,
      0x18ac0,
      0x1c570,
      0x1e2bc,
      0x18a60, // 360
      0x1c538,
      0x11440,
      0x18a30,
      0x1c51c,
      0x11420,
      0x18a18,
      0x11410,
      0x11408,
      0x116c0,
      0x18b70, // 370
      0x1c5bc,
      0x11660,
      0x18b38,
      0x1c59e,
      0x11630,
      0x18b1c,
      0x11618,
      0x1160c,
      0x11770,
      0x18bbc, // 380
      0x11738,
      0x18b9e,
      0x1171c,
      0x117bc,
      0x1179e,
      0x1cd60,
      0x1e6b8,
      0x1f35e,
      0x19a40,
      0x1cd30, // 390
      0x1e69c,
      0x19a20,
      0x1cd18,
      0x1e68e,
      0x19a10,
      0x1cd0c,
      0x19a08,
      0x1cd06,
      0x18960,
      0x1c4b8, // 400
      0x1e25e,
      0x19b60,
      0x18930,
      0x1c49c,
      0x13640,
      0x11220,
      0x1cd9c,
      0x1c48e,
      0x13620,
      0x19b18, // 410
      0x1890c,
      0x13610,
      0x11208,
      0x13608,
      0x11360,
      0x189b8,
      0x1c4de,
      0x13760,
      0x11330,
      0x1cdde, // 420
      0x13730,
      0x19b9c,
      0x1898e,
      0x13718,
      0x1130c,
      0x1370c,
      0x113b8,
      0x189de,
      0x137b8,
      0x1139c, // 430
      0x1379c,
      0x1138e,
      0x113de,
      0x137de,
      0x1dd40,
      0x1eeb0,
      0x1f75c,
      0x1dd20,
      0x1ee98,
      0x1f74e, // 440
      0x1dd10,
      0x1ee8c,
      0x1dd08,
      0x1ee86,
      0x1dd04,
      0x19940,
      0x1ccb0,
      0x1e65c,
      0x1bb40,
      0x19920, // 450
      0x1eedc,
      0x1e64e,
      0x1bb20,
      0x1dd98,
      0x1eece,
      0x1bb10,
      0x19908,
      0x1cc86,
      0x1bb08,
      0x1dd86, // 460
      0x19902,
      0x11140,
      0x188b0,
      0x1c45c,
      0x13340,
      0x11120,
      0x18898,
      0x1c44e,
      0x17740,
      0x13320, // 470
      0x19998,
      0x1ccce,
      0x17720,
      0x1bb98,
      0x1ddce,
      0x18886,
      0x17710,
      0x13308,
      0x19986,
      0x17708, // 480
      0x11102,
      0x111b0,
      0x188dc,
      0x133b0,
      0x11198,
      0x188ce,
      0x177b0,
      0x13398,
      0x199ce,
      0x17798, // 490
      0x1bbce,
      0x11186,
      0x13386,
      0x111dc,
      0x133dc,
      0x111ce,
      0x177dc,
      0x133ce,
      0x1dca0,
      0x1ee58, // 500
      0x1f72e,
      0x1dc90,
      0x1ee4c,
      0x1dc88,
      0x1ee46,
      0x1dc84,
      0x1dc82,
      0x198a0,
      0x1cc58,
      0x1e62e, // 510
      0x1b9a0,
      0x19890,
      0x1ee6e,
      0x1b990,
      0x1dccc,
      0x1cc46,
      0x1b988,
      0x19884,
      0x1b984,
      0x19882, // 520
      0x1b982,
      0x110a0,
      0x18858,
      0x1c42e,
      0x131a0,
      0x11090,
      0x1884c,
      0x173a0,
      0x13190,
      0x198cc, // 530
      0x18846,
      0x17390,
      0x1b9cc,
      0x11084,
      0x17388,
      0x13184,
      0x11082,
      0x13182,
      0x110d8,
      0x1886e, // 540
      0x131d8,
      0x110cc,
      0x173d8,
      0x131cc,
      0x110c6,
      0x173cc,
      0x131c6,
      0x110ee,
      0x173ee,
      0x1dc50, // 550
      0x1ee2c,
      0x1dc48,
      0x1ee26,
      0x1dc44,
      0x1dc42,
      0x19850,
      0x1cc2c,
      0x1b8d0,
      0x19848,
      0x1cc26, // 560
      0x1b8c8,
      0x1dc66,
      0x1b8c4,
      0x19842,
      0x1b8c2,
      0x11050,
      0x1882c,
      0x130d0,
      0x11048,
      0x18826, // 570
      0x171d0,
      0x130c8,
      0x19866,
      0x171c8,
      0x1b8e6,
      0x11042,
      0x171c4,
      0x130c2,
      0x171c2,
      0x130ec, // 580
      0x171ec,
      0x171e6,
      0x1ee16,
      0x1dc22,
      0x1cc16,
      0x19824,
      0x19822,
      0x11028,
      0x13068,
      0x170e8, // 590
      0x11022,
      0x13062,
      0x18560,
      0x10a40,
      0x18530,
      0x10a20,
      0x18518,
      0x1c28e,
      0x10a10,
      0x1850c, // 600
      0x10a08,
      0x18506,
      0x10b60,
      0x185b8,
      0x1c2de,
      0x10b30,
      0x1859c,
      0x10b18,
      0x1858e,
      0x10b0c, // 610
      0x10b06,
      0x10bb8,
      0x185de,
      0x10b9c,
      0x10b8e,
      0x10bde,
      0x18d40,
      0x1c6b0,
      0x1e35c,
      0x18d20, // 620
      0x1c698,
      0x18d10,
      0x1c68c,
      0x18d08,
      0x1c686,
      0x18d04,
      0x10940,
      0x184b0,
      0x1c25c,
      0x11b40, // 630
      0x10920,
      0x1c6dc,
      0x1c24e,
      0x11b20,
      0x18d98,
      0x1c6ce,
      0x11b10,
      0x10908,
      0x18486,
      0x11b08, // 640
      0x18d86,
      0x10902,
      0x109b0,
      0x184dc,
      0x11bb0,
      0x10998,
      0x184ce,
      0x11b98,
      0x18dce,
      0x11b8c, // 650
      0x10986,
      0x109dc,
      0x11bdc,
      0x109ce,
      0x11bce,
      0x1cea0,
      0x1e758,
      0x1f3ae,
      0x1ce90,
      0x1e74c, // 660
      0x1ce88,
      0x1e746,
      0x1ce84,
      0x1ce82,
      0x18ca0,
      0x1c658,
      0x19da0,
      0x18c90,
      0x1c64c,
      0x19d90, // 670
      0x1cecc,
      0x1c646,
      0x19d88,
      0x18c84,
      0x19d84,
      0x18c82,
      0x19d82,
      0x108a0,
      0x18458,
      0x119a0, // 680
      0x10890,
      0x1c66e,
      0x13ba0,
      0x11990,
      0x18ccc,
      0x18446,
      0x13b90,
      0x19dcc,
      0x10884,
      0x13b88, // 690
      0x11984,
      0x10882,
      0x11982,
      0x108d8,
      0x1846e,
      0x119d8,
      0x108cc,
      0x13bd8,
      0x119cc,
      0x108c6, // 700
      0x13bcc,
      0x119c6,
      0x108ee,
      0x119ee,
      0x13bee,
      0x1ef50,
      0x1f7ac,
      0x1ef48,
      0x1f7a6,
      0x1ef44, // 710
      0x1ef42,
      0x1ce50,
      0x1e72c,
      0x1ded0,
      0x1ef6c,
      0x1e726,
      0x1dec8,
      0x1ef66,
      0x1dec4,
      0x1ce42, // 720
      0x1dec2,
      0x18c50,
      0x1c62c,
      0x19cd0,
      0x18c48,
      0x1c626,
      0x1bdd0,
      0x19cc8,
      0x1ce66,
      0x1bdc8, // 730
      0x1dee6,
      0x18c42,
      0x1bdc4,
      0x19cc2,
      0x1bdc2,
      0x10850,
      0x1842c,
      0x118d0,
      0x10848,
      0x18426, // 740
      0x139d0,
      0x118c8,
      0x18c66,
      0x17bd0,
      0x139c8,
      0x19ce6,
      0x10842,
      0x17bc8,
      0x1bde6,
      0x118c2, // 750
      0x17bc4,
      0x1086c,
      0x118ec,
      0x10866,
      0x139ec,
      0x118e6,
      0x17bec,
      0x139e6,
      0x17be6,
      0x1ef28, // 760
      0x1f796,
      0x1ef24,
      0x1ef22,
      0x1ce28,
      0x1e716,
      0x1de68,
      0x1ef36,
      0x1de64,
      0x1ce22,
      0x1de62, // 770
      0x18c28,
      0x1c616,
      0x19c68,
      0x18c24,
      0x1bce8,
      0x19c64,
      0x18c22,
      0x1bce4,
      0x19c62,
      0x1bce2, // 780
      0x10828,
      0x18416,
      0x11868,
      0x18c36,
      0x138e8,
      0x11864,
      0x10822,
      0x179e8,
      0x138e4,
      0x11862, // 790
      0x179e4,
      0x138e2,
      0x179e2,
      0x11876,
      0x179f6,
      0x1ef12,
      0x1de34,
      0x1de32,
      0x19c34,
      0x1bc74, // 800
      0x1bc72,
      0x11834,
      0x13874,
      0x178f4,
      0x178f2,
      0x10540,
      0x10520,
      0x18298,
      0x10510,
      0x10508, // 810
      0x10504,
      0x105b0,
      0x10598,
      0x1058c,
      0x10586,
      0x105dc,
      0x105ce,
      0x186a0,
      0x18690,
      0x1c34c, // 820
      0x18688,
      0x1c346,
      0x18684,
      0x18682,
      0x104a0,
      0x18258,
      0x10da0,
      0x186d8,
      0x1824c,
      0x10d90, // 830
      0x186cc,
      0x10d88,
      0x186c6,
      0x10d84,
      0x10482,
      0x10d82,
      0x104d8,
      0x1826e,
      0x10dd8,
      0x186ee, // 840
      0x10dcc,
      0x104c6,
      0x10dc6,
      0x104ee,
      0x10dee,
      0x1c750,
      0x1c748,
      0x1c744,
      0x1c742,
      0x18650, // 850
      0x18ed0,
      0x1c76c,
      0x1c326,
      0x18ec8,
      0x1c766,
      0x18ec4,
      0x18642,
      0x18ec2,
      0x10450,
      0x10cd0, // 860
      0x10448,
      0x18226,
      0x11dd0,
      0x10cc8,
      0x10444,
      0x11dc8,
      0x10cc4,
      0x10442,
      0x11dc4,
      0x10cc2, // 870
      0x1046c,
      0x10cec,
      0x10466,
      0x11dec,
      0x10ce6,
      0x11de6,
      0x1e7a8,
      0x1e7a4,
      0x1e7a2,
      0x1c728, // 880
      0x1cf68,
      0x1e7b6,
      0x1cf64,
      0x1c722,
      0x1cf62,
      0x18628,
      0x1c316,
      0x18e68,
      0x1c736,
      0x19ee8, // 890
      0x18e64,
      0x18622,
      0x19ee4,
      0x18e62,
      0x19ee2,
      0x10428,
      0x18216,
      0x10c68,
      0x18636,
      0x11ce8, // 900
      0x10c64,
      0x10422,
      0x13de8,
      0x11ce4,
      0x10c62,
      0x13de4,
      0x11ce2,
      0x10436,
      0x10c76,
      0x11cf6, // 910
      0x13df6,
      0x1f7d4,
      0x1f7d2,
      0x1e794,
      0x1efb4,
      0x1e792,
      0x1efb2,
      0x1c714,
      0x1cf34,
      0x1c712, // 920
      0x1df74,
      0x1cf32,
      0x1df72,
      0x18614,
      0x18e34,
      0x18612,
      0x19e74,
      0x18e32,
      0x1bef4,
    ], // 929
    [
      // cluster 3 -----------------------------------------------------------------------
      0x1f560,
      0x1fab8,
      0x1ea40,
      0x1f530,
      0x1fa9c,
      0x1ea20,
      0x1f518,
      0x1fa8e,
      0x1ea10,
      0x1f50c, //  10
      0x1ea08,
      0x1f506,
      0x1ea04,
      0x1eb60,
      0x1f5b8,
      0x1fade,
      0x1d640,
      0x1eb30,
      0x1f59c,
      0x1d620, //  20
      0x1eb18,
      0x1f58e,
      0x1d610,
      0x1eb0c,
      0x1d608,
      0x1eb06,
      0x1d604,
      0x1d760,
      0x1ebb8,
      0x1f5de, //  30
      0x1ae40,
      0x1d730,
      0x1eb9c,
      0x1ae20,
      0x1d718,
      0x1eb8e,
      0x1ae10,
      0x1d70c,
      0x1ae08,
      0x1d706, //  40
      0x1ae04,
      0x1af60,
      0x1d7b8,
      0x1ebde,
      0x15e40,
      0x1af30,
      0x1d79c,
      0x15e20,
      0x1af18,
      0x1d78e, //  50
      0x15e10,
      0x1af0c,
      0x15e08,
      0x1af06,
      0x15f60,
      0x1afb8,
      0x1d7de,
      0x15f30,
      0x1af9c,
      0x15f18, //  60
      0x1af8e,
      0x15f0c,
      0x15fb8,
      0x1afde,
      0x15f9c,
      0x15f8e,
      0x1e940,
      0x1f4b0,
      0x1fa5c,
      0x1e920, //  70
      0x1f498,
      0x1fa4e,
      0x1e910,
      0x1f48c,
      0x1e908,
      0x1f486,
      0x1e904,
      0x1e902,
      0x1d340,
      0x1e9b0, //  80
      0x1f4dc,
      0x1d320,
      0x1e998,
      0x1f4ce,
      0x1d310,
      0x1e98c,
      0x1d308,
      0x1e986,
      0x1d304,
      0x1d302, //  90
      0x1a740,
      0x1d3b0,
      0x1e9dc,
      0x1a720,
      0x1d398,
      0x1e9ce,
      0x1a710,
      0x1d38c,
      0x1a708,
      0x1d386, // 100
      0x1a704,
      0x1a702,
      0x14f40,
      0x1a7b0,
      0x1d3dc,
      0x14f20,
      0x1a798,
      0x1d3ce,
      0x14f10,
      0x1a78c, // 110
      0x14f08,
      0x1a786,
      0x14f04,
      0x14fb0,
      0x1a7dc,
      0x14f98,
      0x1a7ce,
      0x14f8c,
      0x14f86,
      0x14fdc, // 120
      0x14fce,
      0x1e8a0,
      0x1f458,
      0x1fa2e,
      0x1e890,
      0x1f44c,
      0x1e888,
      0x1f446,
      0x1e884,
      0x1e882, // 130
      0x1d1a0,
      0x1e8d8,
      0x1f46e,
      0x1d190,
      0x1e8cc,
      0x1d188,
      0x1e8c6,
      0x1d184,
      0x1d182,
      0x1a3a0, // 140
      0x1d1d8,
      0x1e8ee,
      0x1a390,
      0x1d1cc,
      0x1a388,
      0x1d1c6,
      0x1a384,
      0x1a382,
      0x147a0,
      0x1a3d8, // 150
      0x1d1ee,
      0x14790,
      0x1a3cc,
      0x14788,
      0x1a3c6,
      0x14784,
      0x14782,
      0x147d8,
      0x1a3ee,
      0x147cc, // 160
      0x147c6,
      0x147ee,
      0x1e850,
      0x1f42c,
      0x1e848,
      0x1f426,
      0x1e844,
      0x1e842,
      0x1d0d0,
      0x1e86c, // 170
      0x1d0c8,
      0x1e866,
      0x1d0c4,
      0x1d0c2,
      0x1a1d0,
      0x1d0ec,
      0x1a1c8,
      0x1d0e6,
      0x1a1c4,
      0x1a1c2, // 180
      0x143d0,
      0x1a1ec,
      0x143c8,
      0x1a1e6,
      0x143c4,
      0x143c2,
      0x143ec,
      0x143e6,
      0x1e828,
      0x1f416, // 190
      0x1e824,
      0x1e822,
      0x1d068,
      0x1e836,
      0x1d064,
      0x1d062,
      0x1a0e8,
      0x1d076,
      0x1a0e4,
      0x1a0e2, // 200
      0x141e8,
      0x1a0f6,
      0x141e4,
      0x141e2,
      0x1e814,
      0x1e812,
      0x1d034,
      0x1d032,
      0x1a074,
      0x1a072, // 210
      0x1e540,
      0x1f2b0,
      0x1f95c,
      0x1e520,
      0x1f298,
      0x1f94e,
      0x1e510,
      0x1f28c,
      0x1e508,
      0x1f286, // 220
      0x1e504,
      0x1e502,
      0x1cb40,
      0x1e5b0,
      0x1f2dc,
      0x1cb20,
      0x1e598,
      0x1f2ce,
      0x1cb10,
      0x1e58c, // 230
      0x1cb08,
      0x1e586,
      0x1cb04,
      0x1cb02,
      0x19740,
      0x1cbb0,
      0x1e5dc,
      0x19720,
      0x1cb98,
      0x1e5ce, // 240
      0x19710,
      0x1cb8c,
      0x19708,
      0x1cb86,
      0x19704,
      0x19702,
      0x12f40,
      0x197b0,
      0x1cbdc,
      0x12f20, // 250
      0x19798,
      0x1cbce,
      0x12f10,
      0x1978c,
      0x12f08,
      0x19786,
      0x12f04,
      0x12fb0,
      0x197dc,
      0x12f98, // 260
      0x197ce,
      0x12f8c,
      0x12f86,
      0x12fdc,
      0x12fce,
      0x1f6a0,
      0x1fb58,
      0x16bf0,
      0x1f690,
      0x1fb4c, // 270
      0x169f8,
      0x1f688,
      0x1fb46,
      0x168fc,
      0x1f684,
      0x1f682,
      0x1e4a0,
      0x1f258,
      0x1f92e,
      0x1eda0, // 280
      0x1e490,
      0x1fb6e,
      0x1ed90,
      0x1f6cc,
      0x1f246,
      0x1ed88,
      0x1e484,
      0x1ed84,
      0x1e482,
      0x1ed82, // 290
      0x1c9a0,
      0x1e4d8,
      0x1f26e,
      0x1dba0,
      0x1c990,
      0x1e4cc,
      0x1db90,
      0x1edcc,
      0x1e4c6,
      0x1db88, // 300
      0x1c984,
      0x1db84,
      0x1c982,
      0x1db82,
      0x193a0,
      0x1c9d8,
      0x1e4ee,
      0x1b7a0,
      0x19390,
      0x1c9cc, // 310
      0x1b790,
      0x1dbcc,
      0x1c9c6,
      0x1b788,
      0x19384,
      0x1b784,
      0x19382,
      0x1b782,
      0x127a0,
      0x193d8, // 320
      0x1c9ee,
      0x16fa0,
      0x12790,
      0x193cc,
      0x16f90,
      0x1b7cc,
      0x193c6,
      0x16f88,
      0x12784,
      0x16f84, // 330
      0x12782,
      0x127d8,
      0x193ee,
      0x16fd8,
      0x127cc,
      0x16fcc,
      0x127c6,
      0x16fc6,
      0x127ee,
      0x1f650, // 340
      0x1fb2c,
      0x165f8,
      0x1f648,
      0x1fb26,
      0x164fc,
      0x1f644,
      0x1647e,
      0x1f642,
      0x1e450,
      0x1f22c, // 350
      0x1ecd0,
      0x1e448,
      0x1f226,
      0x1ecc8,
      0x1f666,
      0x1ecc4,
      0x1e442,
      0x1ecc2,
      0x1c8d0,
      0x1e46c, // 360
      0x1d9d0,
      0x1c8c8,
      0x1e466,
      0x1d9c8,
      0x1ece6,
      0x1d9c4,
      0x1c8c2,
      0x1d9c2,
      0x191d0,
      0x1c8ec, // 370
      0x1b3d0,
      0x191c8,
      0x1c8e6,
      0x1b3c8,
      0x1d9e6,
      0x1b3c4,
      0x191c2,
      0x1b3c2,
      0x123d0,
      0x191ec, // 380
      0x167d0,
      0x123c8,
      0x191e6,
      0x167c8,
      0x1b3e6,
      0x167c4,
      0x123c2,
      0x167c2,
      0x123ec,
      0x167ec, // 390
      0x123e6,
      0x167e6,
      0x1f628,
      0x1fb16,
      0x162fc,
      0x1f624,
      0x1627e,
      0x1f622,
      0x1e428,
      0x1f216, // 400
      0x1ec68,
      0x1f636,
      0x1ec64,
      0x1e422,
      0x1ec62,
      0x1c868,
      0x1e436,
      0x1d8e8,
      0x1c864,
      0x1d8e4, // 410
      0x1c862,
      0x1d8e2,
      0x190e8,
      0x1c876,
      0x1b1e8,
      0x1d8f6,
      0x1b1e4,
      0x190e2,
      0x1b1e2,
      0x121e8, // 420
      0x190f6,
      0x163e8,
      0x121e4,
      0x163e4,
      0x121e2,
      0x163e2,
      0x121f6,
      0x163f6,
      0x1f614,
      0x1617e, // 430
      0x1f612,
      0x1e414,
      0x1ec34,
      0x1e412,
      0x1ec32,
      0x1c834,
      0x1d874,
      0x1c832,
      0x1d872,
      0x19074, // 440
      0x1b0f4,
      0x19072,
      0x1b0f2,
      0x120f4,
      0x161f4,
      0x120f2,
      0x161f2,
      0x1f60a,
      0x1e40a,
      0x1ec1a, // 450
      0x1c81a,
      0x1d83a,
      0x1903a,
      0x1b07a,
      0x1e2a0,
      0x1f158,
      0x1f8ae,
      0x1e290,
      0x1f14c,
      0x1e288, // 460
      0x1f146,
      0x1e284,
      0x1e282,
      0x1c5a0,
      0x1e2d8,
      0x1f16e,
      0x1c590,
      0x1e2cc,
      0x1c588,
      0x1e2c6, // 470
      0x1c584,
      0x1c582,
      0x18ba0,
      0x1c5d8,
      0x1e2ee,
      0x18b90,
      0x1c5cc,
      0x18b88,
      0x1c5c6,
      0x18b84, // 480
      0x18b82,
      0x117a0,
      0x18bd8,
      0x1c5ee,
      0x11790,
      0x18bcc,
      0x11788,
      0x18bc6,
      0x11784,
      0x11782, // 490
      0x117d8,
      0x18bee,
      0x117cc,
      0x117c6,
      0x117ee,
      0x1f350,
      0x1f9ac,
      0x135f8,
      0x1f348,
      0x1f9a6, // 500
      0x134fc,
      0x1f344,
      0x1347e,
      0x1f342,
      0x1e250,
      0x1f12c,
      0x1e6d0,
      0x1e248,
      0x1f126,
      0x1e6c8, // 510
      0x1f366,
      0x1e6c4,
      0x1e242,
      0x1e6c2,
      0x1c4d0,
      0x1e26c,
      0x1cdd0,
      0x1c4c8,
      0x1e266,
      0x1cdc8, // 520
      0x1e6e6,
      0x1cdc4,
      0x1c4c2,
      0x1cdc2,
      0x189d0,
      0x1c4ec,
      0x19bd0,
      0x189c8,
      0x1c4e6,
      0x19bc8, // 530
      0x1cde6,
      0x19bc4,
      0x189c2,
      0x19bc2,
      0x113d0,
      0x189ec,
      0x137d0,
      0x113c8,
      0x189e6,
      0x137c8, // 540
      0x19be6,
      0x137c4,
      0x113c2,
      0x137c2,
      0x113ec,
      0x137ec,
      0x113e6,
      0x137e6,
      0x1fba8,
      0x175f0, // 550
      0x1bafc,
      0x1fba4,
      0x174f8,
      0x1ba7e,
      0x1fba2,
      0x1747c,
      0x1743e,
      0x1f328,
      0x1f996,
      0x132fc, // 560
      0x1f768,
      0x1fbb6,
      0x176fc,
      0x1327e,
      0x1f764,
      0x1f322,
      0x1767e,
      0x1f762,
      0x1e228,
      0x1f116, // 570
      0x1e668,
      0x1e224,
      0x1eee8,
      0x1f776,
      0x1e222,
      0x1eee4,
      0x1e662,
      0x1eee2,
      0x1c468,
      0x1e236, // 580
      0x1cce8,
      0x1c464,
      0x1dde8,
      0x1cce4,
      0x1c462,
      0x1dde4,
      0x1cce2,
      0x1dde2,
      0x188e8,
      0x1c476, // 590
      0x199e8,
      0x188e4,
      0x1bbe8,
      0x199e4,
      0x188e2,
      0x1bbe4,
      0x199e2,
      0x1bbe2,
      0x111e8,
      0x188f6, // 600
      0x133e8,
      0x111e4,
      0x177e8,
      0x133e4,
      0x111e2,
      0x177e4,
      0x133e2,
      0x177e2,
      0x111f6,
      0x133f6, // 610
      0x1fb94,
      0x172f8,
      0x1b97e,
      0x1fb92,
      0x1727c,
      0x1723e,
      0x1f314,
      0x1317e,
      0x1f734,
      0x1f312, // 620
      0x1737e,
      0x1f732,
      0x1e214,
      0x1e634,
      0x1e212,
      0x1ee74,
      0x1e632,
      0x1ee72,
      0x1c434,
      0x1cc74, // 630
      0x1c432,
      0x1dcf4,
      0x1cc72,
      0x1dcf2,
      0x18874,
      0x198f4,
      0x18872,
      0x1b9f4,
      0x198f2,
      0x1b9f2, // 640
      0x110f4,
      0x131f4,
      0x110f2,
      0x173f4,
      0x131f2,
      0x173f2,
      0x1fb8a,
      0x1717c,
      0x1713e,
      0x1f30a, // 650
      0x1f71a,
      0x1e20a,
      0x1e61a,
      0x1ee3a,
      0x1c41a,
      0x1cc3a,
      0x1dc7a,
      0x1883a,
      0x1987a,
      0x1b8fa, // 660
      0x1107a,
      0x130fa,
      0x171fa,
      0x170be,
      0x1e150,
      0x1f0ac,
      0x1e148,
      0x1f0a6,
      0x1e144,
      0x1e142, // 670
      0x1c2d0,
      0x1e16c,
      0x1c2c8,
      0x1e166,
      0x1c2c4,
      0x1c2c2,
      0x185d0,
      0x1c2ec,
      0x185c8,
      0x1c2e6, // 680
      0x185c4,
      0x185c2,
      0x10bd0,
      0x185ec,
      0x10bc8,
      0x185e6,
      0x10bc4,
      0x10bc2,
      0x10bec,
      0x10be6, // 690
      0x1f1a8,
      0x1f8d6,
      0x11afc,
      0x1f1a4,
      0x11a7e,
      0x1f1a2,
      0x1e128,
      0x1f096,
      0x1e368,
      0x1e124, // 700
      0x1e364,
      0x1e122,
      0x1e362,
      0x1c268,
      0x1e136,
      0x1c6e8,
      0x1c264,
      0x1c6e4,
      0x1c262,
      0x1c6e2, // 710
      0x184e8,
      0x1c276,
      0x18de8,
      0x184e4,
      0x18de4,
      0x184e2,
      0x18de2,
      0x109e8,
      0x184f6,
      0x11be8, // 720
      0x109e4,
      0x11be4,
      0x109e2,
      0x11be2,
      0x109f6,
      0x11bf6,
      0x1f9d4,
      0x13af8,
      0x19d7e,
      0x1f9d2, // 730
      0x13a7c,
      0x13a3e,
      0x1f194,
      0x1197e,
      0x1f3b4,
      0x1f192,
      0x13b7e,
      0x1f3b2,
      0x1e114,
      0x1e334, // 740
      0x1e112,
      0x1e774,
      0x1e332,
      0x1e772,
      0x1c234,
      0x1c674,
      0x1c232,
      0x1cef4,
      0x1c672,
      0x1cef2, // 750
      0x18474,
      0x18cf4,
      0x18472,
      0x19df4,
      0x18cf2,
      0x19df2,
      0x108f4,
      0x119f4,
      0x108f2,
      0x13bf4, // 760
      0x119f2,
      0x13bf2,
      0x17af0,
      0x1bd7c,
      0x17a78,
      0x1bd3e,
      0x17a3c,
      0x17a1e,
      0x1f9ca,
      0x1397c, // 770
      0x1fbda,
      0x17b7c,
      0x1393e,
      0x17b3e,
      0x1f18a,
      0x1f39a,
      0x1f7ba,
      0x1e10a,
      0x1e31a,
      0x1e73a, // 780
      0x1ef7a,
      0x1c21a,
      0x1c63a,
      0x1ce7a,
      0x1defa,
      0x1843a,
      0x18c7a,
      0x19cfa,
      0x1bdfa,
      0x1087a, // 790
      0x118fa,
      0x139fa,
      0x17978,
      0x1bcbe,
      0x1793c,
      0x1791e,
      0x138be,
      0x179be,
      0x178bc,
      0x1789e, // 800
      0x1785e,
      0x1e0a8,
      0x1e0a4,
      0x1e0a2,
      0x1c168,
      0x1e0b6,
      0x1c164,
      0x1c162,
      0x182e8,
      0x1c176, // 810
      0x182e4,
      0x182e2,
      0x105e8,
      0x182f6,
      0x105e4,
      0x105e2,
      0x105f6,
      0x1f0d4,
      0x10d7e,
      0x1f0d2, // 820
      0x1e094,
      0x1e1b4,
      0x1e092,
      0x1e1b2,
      0x1c134,
      0x1c374,
      0x1c132,
      0x1c372,
      0x18274,
      0x186f4, // 830
      0x18272,
      0x186f2,
      0x104f4,
      0x10df4,
      0x104f2,
      0x10df2,
      0x1f8ea,
      0x11d7c,
      0x11d3e,
      0x1f0ca, // 840
      0x1f1da,
      0x1e08a,
      0x1e19a,
      0x1e3ba,
      0x1c11a,
      0x1c33a,
      0x1c77a,
      0x1823a,
      0x1867a,
      0x18efa, // 850
      0x1047a,
      0x10cfa,
      0x11dfa,
      0x13d78,
      0x19ebe,
      0x13d3c,
      0x13d1e,
      0x11cbe,
      0x13dbe,
      0x17d70, // 860
      0x1bebc,
      0x17d38,
      0x1be9e,
      0x17d1c,
      0x17d0e,
      0x13cbc,
      0x17dbc,
      0x13c9e,
      0x17d9e,
      0x17cb8, // 870
      0x1be5e,
      0x17c9c,
      0x17c8e,
      0x13c5e,
      0x17cde,
      0x17c5c,
      0x17c4e,
      0x17c2e,
      0x1c0b4,
      0x1c0b2, // 880
      0x18174,
      0x18172,
      0x102f4,
      0x102f2,
      0x1e0da,
      0x1c09a,
      0x1c1ba,
      0x1813a,
      0x1837a,
      0x1027a, // 890
      0x106fa,
      0x10ebe,
      0x11ebc,
      0x11e9e,
      0x13eb8,
      0x19f5e,
      0x13e9c,
      0x13e8e,
      0x11e5e,
      0x13ede, // 900
      0x17eb0,
      0x1bf5c,
      0x17e98,
      0x1bf4e,
      0x17e8c,
      0x17e86,
      0x13e5c,
      0x17edc,
      0x13e4e,
      0x17ece, // 910
      0x17e58,
      0x1bf2e,
      0x17e4c,
      0x17e46,
      0x13e2e,
      0x17e6e,
      0x17e2c,
      0x17e26,
      0x10f5e,
      0x11f5c, // 920
      0x11f4e,
      0x13f58,
      0x19fae,
      0x13f4c,
      0x13f46,
      0x11f2e,
      0x13f6e,
      0x13f2c,
      0x13f26,
    ], // 929
    [
      // cluster 6 -----------------------------------------------------------------------
      0x1abe0,
      0x1d5f8,
      0x153c0,
      0x1a9f0,
      0x1d4fc,
      0x151e0,
      0x1a8f8,
      0x1d47e,
      0x150f0,
      0x1a87c, //  10
      0x15078,
      0x1fad0,
      0x15be0,
      0x1adf8,
      0x1fac8,
      0x159f0,
      0x1acfc,
      0x1fac4,
      0x158f8,
      0x1ac7e, //  20
      0x1fac2,
      0x1587c,
      0x1f5d0,
      0x1faec,
      0x15df8,
      0x1f5c8,
      0x1fae6,
      0x15cfc,
      0x1f5c4,
      0x15c7e, //  30
      0x1f5c2,
      0x1ebd0,
      0x1f5ec,
      0x1ebc8,
      0x1f5e6,
      0x1ebc4,
      0x1ebc2,
      0x1d7d0,
      0x1ebec,
      0x1d7c8, //  40
      0x1ebe6,
      0x1d7c4,
      0x1d7c2,
      0x1afd0,
      0x1d7ec,
      0x1afc8,
      0x1d7e6,
      0x1afc4,
      0x14bc0,
      0x1a5f0, //  50
      0x1d2fc,
      0x149e0,
      0x1a4f8,
      0x1d27e,
      0x148f0,
      0x1a47c,
      0x14878,
      0x1a43e,
      0x1483c,
      0x1fa68, //  60
      0x14df0,
      0x1a6fc,
      0x1fa64,
      0x14cf8,
      0x1a67e,
      0x1fa62,
      0x14c7c,
      0x14c3e,
      0x1f4e8,
      0x1fa76, //  70
      0x14efc,
      0x1f4e4,
      0x14e7e,
      0x1f4e2,
      0x1e9e8,
      0x1f4f6,
      0x1e9e4,
      0x1e9e2,
      0x1d3e8,
      0x1e9f6, //  80
      0x1d3e4,
      0x1d3e2,
      0x1a7e8,
      0x1d3f6,
      0x1a7e4,
      0x1a7e2,
      0x145e0,
      0x1a2f8,
      0x1d17e,
      0x144f0, //  90
      0x1a27c,
      0x14478,
      0x1a23e,
      0x1443c,
      0x1441e,
      0x1fa34,
      0x146f8,
      0x1a37e,
      0x1fa32,
      0x1467c, // 100
      0x1463e,
      0x1f474,
      0x1477e,
      0x1f472,
      0x1e8f4,
      0x1e8f2,
      0x1d1f4,
      0x1d1f2,
      0x1a3f4,
      0x1a3f2, // 110
      0x142f0,
      0x1a17c,
      0x14278,
      0x1a13e,
      0x1423c,
      0x1421e,
      0x1fa1a,
      0x1437c,
      0x1433e,
      0x1f43a, // 120
      0x1e87a,
      0x1d0fa,
      0x14178,
      0x1a0be,
      0x1413c,
      0x1411e,
      0x141be,
      0x140bc,
      0x1409e,
      0x12bc0, // 130
      0x195f0,
      0x1cafc,
      0x129e0,
      0x194f8,
      0x1ca7e,
      0x128f0,
      0x1947c,
      0x12878,
      0x1943e,
      0x1283c, // 140
      0x1f968,
      0x12df0,
      0x196fc,
      0x1f964,
      0x12cf8,
      0x1967e,
      0x1f962,
      0x12c7c,
      0x12c3e,
      0x1f2e8, // 150
      0x1f976,
      0x12efc,
      0x1f2e4,
      0x12e7e,
      0x1f2e2,
      0x1e5e8,
      0x1f2f6,
      0x1e5e4,
      0x1e5e2,
      0x1cbe8, // 160
      0x1e5f6,
      0x1cbe4,
      0x1cbe2,
      0x197e8,
      0x1cbf6,
      0x197e4,
      0x197e2,
      0x1b5e0,
      0x1daf8,
      0x1ed7e, // 170
      0x169c0,
      0x1b4f0,
      0x1da7c,
      0x168e0,
      0x1b478,
      0x1da3e,
      0x16870,
      0x1b43c,
      0x16838,
      0x1b41e, // 180
      0x1681c,
      0x125e0,
      0x192f8,
      0x1c97e,
      0x16de0,
      0x124f0,
      0x1927c,
      0x16cf0,
      0x1b67c,
      0x1923e, // 190
      0x16c78,
      0x1243c,
      0x16c3c,
      0x1241e,
      0x16c1e,
      0x1f934,
      0x126f8,
      0x1937e,
      0x1fb74,
      0x1f932, // 200
      0x16ef8,
      0x1267c,
      0x1fb72,
      0x16e7c,
      0x1263e,
      0x16e3e,
      0x1f274,
      0x1277e,
      0x1f6f4,
      0x1f272, // 210
      0x16f7e,
      0x1f6f2,
      0x1e4f4,
      0x1edf4,
      0x1e4f2,
      0x1edf2,
      0x1c9f4,
      0x1dbf4,
      0x1c9f2,
      0x1dbf2, // 220
      0x193f4,
      0x193f2,
      0x165c0,
      0x1b2f0,
      0x1d97c,
      0x164e0,
      0x1b278,
      0x1d93e,
      0x16470,
      0x1b23c, // 230
      0x16438,
      0x1b21e,
      0x1641c,
      0x1640e,
      0x122f0,
      0x1917c,
      0x166f0,
      0x12278,
      0x1913e,
      0x16678, // 240
      0x1b33e,
      0x1663c,
      0x1221e,
      0x1661e,
      0x1f91a,
      0x1237c,
      0x1fb3a,
      0x1677c,
      0x1233e,
      0x1673e, // 250
      0x1f23a,
      0x1f67a,
      0x1e47a,
      0x1ecfa,
      0x1c8fa,
      0x1d9fa,
      0x191fa,
      0x162e0,
      0x1b178,
      0x1d8be, // 260
      0x16270,
      0x1b13c,
      0x16238,
      0x1b11e,
      0x1621c,
      0x1620e,
      0x12178,
      0x190be,
      0x16378,
      0x1213c, // 270
      0x1633c,
      0x1211e,
      0x1631e,
      0x121be,
      0x163be,
      0x16170,
      0x1b0bc,
      0x16138,
      0x1b09e,
      0x1611c, // 280
      0x1610e,
      0x120bc,
      0x161bc,
      0x1209e,
      0x1619e,
      0x160b8,
      0x1b05e,
      0x1609c,
      0x1608e,
      0x1205e, // 290
      0x160de,
      0x1605c,
      0x1604e,
      0x115e0,
      0x18af8,
      0x1c57e,
      0x114f0,
      0x18a7c,
      0x11478,
      0x18a3e, // 300
      0x1143c,
      0x1141e,
      0x1f8b4,
      0x116f8,
      0x18b7e,
      0x1f8b2,
      0x1167c,
      0x1163e,
      0x1f174,
      0x1177e, // 310
      0x1f172,
      0x1e2f4,
      0x1e2f2,
      0x1c5f4,
      0x1c5f2,
      0x18bf4,
      0x18bf2,
      0x135c0,
      0x19af0,
      0x1cd7c, // 320
      0x134e0,
      0x19a78,
      0x1cd3e,
      0x13470,
      0x19a3c,
      0x13438,
      0x19a1e,
      0x1341c,
      0x1340e,
      0x112f0, // 330
      0x1897c,
      0x136f0,
      0x11278,
      0x1893e,
      0x13678,
      0x19b3e,
      0x1363c,
      0x1121e,
      0x1361e,
      0x1f89a, // 340
      0x1137c,
      0x1f9ba,
      0x1377c,
      0x1133e,
      0x1373e,
      0x1f13a,
      0x1f37a,
      0x1e27a,
      0x1e6fa,
      0x1c4fa, // 350
      0x1cdfa,
      0x189fa,
      0x1bae0,
      0x1dd78,
      0x1eebe,
      0x174c0,
      0x1ba70,
      0x1dd3c,
      0x17460,
      0x1ba38, // 360
      0x1dd1e,
      0x17430,
      0x1ba1c,
      0x17418,
      0x1ba0e,
      0x1740c,
      0x132e0,
      0x19978,
      0x1ccbe,
      0x176e0, // 370
      0x13270,
      0x1993c,
      0x17670,
      0x1bb3c,
      0x1991e,
      0x17638,
      0x1321c,
      0x1761c,
      0x1320e,
      0x1760e, // 380
      0x11178,
      0x188be,
      0x13378,
      0x1113c,
      0x17778,
      0x1333c,
      0x1111e,
      0x1773c,
      0x1331e,
      0x1771e, // 390
      0x111be,
      0x133be,
      0x177be,
      0x172c0,
      0x1b970,
      0x1dcbc,
      0x17260,
      0x1b938,
      0x1dc9e,
      0x17230, // 400
      0x1b91c,
      0x17218,
      0x1b90e,
      0x1720c,
      0x17206,
      0x13170,
      0x198bc,
      0x17370,
      0x13138,
      0x1989e, // 410
      0x17338,
      0x1b99e,
      0x1731c,
      0x1310e,
      0x1730e,
      0x110bc,
      0x131bc,
      0x1109e,
      0x173bc,
      0x1319e, // 420
      0x1739e,
      0x17160,
      0x1b8b8,
      0x1dc5e,
      0x17130,
      0x1b89c,
      0x17118,
      0x1b88e,
      0x1710c,
      0x17106, // 430
      0x130b8,
      0x1985e,
      0x171b8,
      0x1309c,
      0x1719c,
      0x1308e,
      0x1718e,
      0x1105e,
      0x130de,
      0x171de, // 440
      0x170b0,
      0x1b85c,
      0x17098,
      0x1b84e,
      0x1708c,
      0x17086,
      0x1305c,
      0x170dc,
      0x1304e,
      0x170ce, // 450
      0x17058,
      0x1b82e,
      0x1704c,
      0x17046,
      0x1302e,
      0x1706e,
      0x1702c,
      0x17026,
      0x10af0,
      0x1857c, // 460
      0x10a78,
      0x1853e,
      0x10a3c,
      0x10a1e,
      0x10b7c,
      0x10b3e,
      0x1f0ba,
      0x1e17a,
      0x1c2fa,
      0x185fa, // 470
      0x11ae0,
      0x18d78,
      0x1c6be,
      0x11a70,
      0x18d3c,
      0x11a38,
      0x18d1e,
      0x11a1c,
      0x11a0e,
      0x10978, // 480
      0x184be,
      0x11b78,
      0x1093c,
      0x11b3c,
      0x1091e,
      0x11b1e,
      0x109be,
      0x11bbe,
      0x13ac0,
      0x19d70, // 490
      0x1cebc,
      0x13a60,
      0x19d38,
      0x1ce9e,
      0x13a30,
      0x19d1c,
      0x13a18,
      0x19d0e,
      0x13a0c,
      0x13a06, // 500
      0x11970,
      0x18cbc,
      0x13b70,
      0x11938,
      0x18c9e,
      0x13b38,
      0x1191c,
      0x13b1c,
      0x1190e,
      0x13b0e, // 510
      0x108bc,
      0x119bc,
      0x1089e,
      0x13bbc,
      0x1199e,
      0x13b9e,
      0x1bd60,
      0x1deb8,
      0x1ef5e,
      0x17a40, // 520
      0x1bd30,
      0x1de9c,
      0x17a20,
      0x1bd18,
      0x1de8e,
      0x17a10,
      0x1bd0c,
      0x17a08,
      0x1bd06,
      0x17a04, // 530
      0x13960,
      0x19cb8,
      0x1ce5e,
      0x17b60,
      0x13930,
      0x19c9c,
      0x17b30,
      0x1bd9c,
      0x19c8e,
      0x17b18, // 540
      0x1390c,
      0x17b0c,
      0x13906,
      0x17b06,
      0x118b8,
      0x18c5e,
      0x139b8,
      0x1189c,
      0x17bb8,
      0x1399c, // 550
      0x1188e,
      0x17b9c,
      0x1398e,
      0x17b8e,
      0x1085e,
      0x118de,
      0x139de,
      0x17bde,
      0x17940,
      0x1bcb0, // 560
      0x1de5c,
      0x17920,
      0x1bc98,
      0x1de4e,
      0x17910,
      0x1bc8c,
      0x17908,
      0x1bc86,
      0x17904,
      0x17902, // 570
      0x138b0,
      0x19c5c,
      0x179b0,
      0x13898,
      0x19c4e,
      0x17998,
      0x1bcce,
      0x1798c,
      0x13886,
      0x17986, // 580
      0x1185c,
      0x138dc,
      0x1184e,
      0x179dc,
      0x138ce,
      0x179ce,
      0x178a0,
      0x1bc58,
      0x1de2e,
      0x17890, // 590
      0x1bc4c,
      0x17888,
      0x1bc46,
      0x17884,
      0x17882,
      0x13858,
      0x19c2e,
      0x178d8,
      0x1384c,
      0x178cc, // 600
      0x13846,
      0x178c6,
      0x1182e,
      0x1386e,
      0x178ee,
      0x17850,
      0x1bc2c,
      0x17848,
      0x1bc26,
      0x17844, // 610
      0x17842,
      0x1382c,
      0x1786c,
      0x13826,
      0x17866,
      0x17828,
      0x1bc16,
      0x17824,
      0x17822,
      0x13816, // 620
      0x17836,
      0x10578,
      0x182be,
      0x1053c,
      0x1051e,
      0x105be,
      0x10d70,
      0x186bc,
      0x10d38,
      0x1869e, // 630
      0x10d1c,
      0x10d0e,
      0x104bc,
      0x10dbc,
      0x1049e,
      0x10d9e,
      0x11d60,
      0x18eb8,
      0x1c75e,
      0x11d30, // 640
      0x18e9c,
      0x11d18,
      0x18e8e,
      0x11d0c,
      0x11d06,
      0x10cb8,
      0x1865e,
      0x11db8,
      0x10c9c,
      0x11d9c, // 650
      0x10c8e,
      0x11d8e,
      0x1045e,
      0x10cde,
      0x11dde,
      0x13d40,
      0x19eb0,
      0x1cf5c,
      0x13d20,
      0x19e98, // 660
      0x1cf4e,
      0x13d10,
      0x19e8c,
      0x13d08,
      0x19e86,
      0x13d04,
      0x13d02,
      0x11cb0,
      0x18e5c,
      0x13db0, // 670
      0x11c98,
      0x18e4e,
      0x13d98,
      0x19ece,
      0x13d8c,
      0x11c86,
      0x13d86,
      0x10c5c,
      0x11cdc,
      0x10c4e, // 680
      0x13ddc,
      0x11cce,
      0x13dce,
      0x1bea0,
      0x1df58,
      0x1efae,
      0x1be90,
      0x1df4c,
      0x1be88,
      0x1df46, // 690
      0x1be84,
      0x1be82,
      0x13ca0,
      0x19e58,
      0x1cf2e,
      0x17da0,
      0x13c90,
      0x19e4c,
      0x17d90,
      0x1becc, // 700
      0x19e46,
      0x17d88,
      0x13c84,
      0x17d84,
      0x13c82,
      0x17d82,
      0x11c58,
      0x18e2e,
      0x13cd8,
      0x11c4c, // 710
      0x17dd8,
      0x13ccc,
      0x11c46,
      0x17dcc,
      0x13cc6,
      0x17dc6,
      0x10c2e,
      0x11c6e,
      0x13cee,
      0x17dee, // 720
      0x1be50,
      0x1df2c,
      0x1be48,
      0x1df26,
      0x1be44,
      0x1be42,
      0x13c50,
      0x19e2c,
      0x17cd0,
      0x13c48, // 730
      0x19e26,
      0x17cc8,
      0x1be66,
      0x17cc4,
      0x13c42,
      0x17cc2,
      0x11c2c,
      0x13c6c,
      0x11c26,
      0x17cec, // 740
      0x13c66,
      0x17ce6,
      0x1be28,
      0x1df16,
      0x1be24,
      0x1be22,
      0x13c28,
      0x19e16,
      0x17c68,
      0x13c24, // 750
      0x17c64,
      0x13c22,
      0x17c62,
      0x11c16,
      0x13c36,
      0x17c76,
      0x1be14,
      0x1be12,
      0x13c14,
      0x17c34, // 760
      0x13c12,
      0x17c32,
      0x102bc,
      0x1029e,
      0x106b8,
      0x1835e,
      0x1069c,
      0x1068e,
      0x1025e,
      0x106de, // 770
      0x10eb0,
      0x1875c,
      0x10e98,
      0x1874e,
      0x10e8c,
      0x10e86,
      0x1065c,
      0x10edc,
      0x1064e,
      0x10ece, // 780
      0x11ea0,
      0x18f58,
      0x1c7ae,
      0x11e90,
      0x18f4c,
      0x11e88,
      0x18f46,
      0x11e84,
      0x11e82,
      0x10e58, // 790
      0x1872e,
      0x11ed8,
      0x18f6e,
      0x11ecc,
      0x10e46,
      0x11ec6,
      0x1062e,
      0x10e6e,
      0x11eee,
      0x19f50, // 800
      0x1cfac,
      0x19f48,
      0x1cfa6,
      0x19f44,
      0x19f42,
      0x11e50,
      0x18f2c,
      0x13ed0,
      0x19f6c,
      0x18f26, // 810
      0x13ec8,
      0x11e44,
      0x13ec4,
      0x11e42,
      0x13ec2,
      0x10e2c,
      0x11e6c,
      0x10e26,
      0x13eec,
      0x11e66, // 820
      0x13ee6,
      0x1dfa8,
      0x1efd6,
      0x1dfa4,
      0x1dfa2,
      0x19f28,
      0x1cf96,
      0x1bf68,
      0x19f24,
      0x1bf64, // 830
      0x19f22,
      0x1bf62,
      0x11e28,
      0x18f16,
      0x13e68,
      0x11e24,
      0x17ee8,
      0x13e64,
      0x11e22,
      0x17ee4, // 840
      0x13e62,
      0x17ee2,
      0x10e16,
      0x11e36,
      0x13e76,
      0x17ef6,
      0x1df94,
      0x1df92,
      0x19f14,
      0x1bf34, // 850
      0x19f12,
      0x1bf32,
      0x11e14,
      0x13e34,
      0x11e12,
      0x17e74,
      0x13e32,
      0x17e72,
      0x1df8a,
      0x19f0a, // 860
      0x1bf1a,
      0x11e0a,
      0x13e1a,
      0x17e3a,
      0x1035c,
      0x1034e,
      0x10758,
      0x183ae,
      0x1074c,
      0x10746, // 870
      0x1032e,
      0x1076e,
      0x10f50,
      0x187ac,
      0x10f48,
      0x187a6,
      0x10f44,
      0x10f42,
      0x1072c,
      0x10f6c, // 880
      0x10726,
      0x10f66,
      0x18fa8,
      0x1c7d6,
      0x18fa4,
      0x18fa2,
      0x10f28,
      0x18796,
      0x11f68,
      0x18fb6, // 890
      0x11f64,
      0x10f22,
      0x11f62,
      0x10716,
      0x10f36,
      0x11f76,
      0x1cfd4,
      0x1cfd2,
      0x18f94,
      0x19fb4, // 900
      0x18f92,
      0x19fb2,
      0x10f14,
      0x11f34,
      0x10f12,
      0x13f74,
      0x11f32,
      0x13f72,
      0x1cfca,
      0x18f8a, // 910
      0x19f9a,
      0x10f0a,
      0x11f1a,
      0x13f3a,
      0x103ac,
      0x103a6,
      0x107a8,
      0x183d6,
      0x107a4,
      0x107a2, // 920
      0x10396,
      0x107b6,
      0x187d4,
      0x187d2,
      0x10794,
      0x10fb4,
      0x10792,
      0x10fb2,
      0x1c7ea,
    ], // 929
  ],

  /**
   * Array of factors of the Reed-Solomon polynomial equations used for error correction; one sub array for each correction level (0-8).
   * @protected
   */
  rsfactors: [
    [
      // ECL 0 (2 factors) -------------------------------------------------------------------------------
      0x01b,
      0x395,
    ], //   2
    [
      // ECL 1 (4 factors) -------------------------------------------------------------------------------
      0x20a,
      0x238,
      0x2d3,
      0x329,
    ], //   4
    [
      // ECL 2 (8 factors) -------------------------------------------------------------------------------
      0x0ed,
      0x134,
      0x1b4,
      0x11c,
      0x286,
      0x28d,
      0x1ac,
      0x17b,
    ], //   8
    [
      // ECL 3 (16 factors) ------------------------------------------------------------------------------
      0x112,
      0x232,
      0x0e8,
      0x2f3,
      0x257,
      0x20c,
      0x321,
      0x084,
      0x127,
      0x074,
      0x1ba,
      0x1ac,
      0x127,
      0x02a,
      0x0b0,
      0x041,
    ], //  16
    [
      // ECL 4 (32 factors) ------------------------------------------------------------------------------
      0x169,
      0x23f,
      0x39a,
      0x20d,
      0x0b0,
      0x24a,
      0x280,
      0x141,
      0x218,
      0x2e6,
      0x2a5,
      0x2e6,
      0x2af,
      0x11c,
      0x0c1,
      0x205, //  16
      0x111,
      0x1ee,
      0x107,
      0x093,
      0x251,
      0x320,
      0x23b,
      0x140,
      0x323,
      0x085,
      0x0e7,
      0x186,
      0x2ad,
      0x14a,
      0x03f,
      0x19a,
    ], //  32
    [
      // ECL 5 (64 factors) ------------------------------------------------------------------------------
      0x21b,
      0x1a6,
      0x006,
      0x05d,
      0x35e,
      0x303,
      0x1c5,
      0x06a,
      0x262,
      0x11f,
      0x06b,
      0x1f9,
      0x2dd,
      0x36d,
      0x17d,
      0x264, //  16
      0x2d3,
      0x1dc,
      0x1ce,
      0x0ac,
      0x1ae,
      0x261,
      0x35a,
      0x336,
      0x21f,
      0x178,
      0x1ff,
      0x190,
      0x2a0,
      0x2fa,
      0x11b,
      0x0b8, //  32
      0x1b8,
      0x023,
      0x207,
      0x01f,
      0x1cc,
      0x252,
      0x0e1,
      0x217,
      0x205,
      0x160,
      0x25d,
      0x09e,
      0x28b,
      0x0c9,
      0x1e8,
      0x1f6, //  48
      0x288,
      0x2dd,
      0x2cd,
      0x053,
      0x194,
      0x061,
      0x118,
      0x303,
      0x348,
      0x275,
      0x004,
      0x17d,
      0x34b,
      0x26f,
      0x108,
      0x21f,
    ], //  64
    [
      // ECL 6 (128 factors) -----------------------------------------------------------------------------
      0x209,
      0x136,
      0x360,
      0x223,
      0x35a,
      0x244,
      0x128,
      0x17b,
      0x035,
      0x30b,
      0x381,
      0x1bc,
      0x190,
      0x39d,
      0x2ed,
      0x19f, //  16
      0x336,
      0x05d,
      0x0d9,
      0x0d0,
      0x3a0,
      0x0f4,
      0x247,
      0x26c,
      0x0f6,
      0x094,
      0x1bf,
      0x277,
      0x124,
      0x38c,
      0x1ea,
      0x2c0, //  32
      0x204,
      0x102,
      0x1c9,
      0x38b,
      0x252,
      0x2d3,
      0x2a2,
      0x124,
      0x110,
      0x060,
      0x2ac,
      0x1b0,
      0x2ae,
      0x25e,
      0x35c,
      0x239, //  48
      0x0c1,
      0x0db,
      0x081,
      0x0ba,
      0x0ec,
      0x11f,
      0x0c0,
      0x307,
      0x116,
      0x0ad,
      0x028,
      0x17b,
      0x2c8,
      0x1cf,
      0x286,
      0x308, //  64
      0x0ab,
      0x1eb,
      0x129,
      0x2fb,
      0x09c,
      0x2dc,
      0x05f,
      0x10e,
      0x1bf,
      0x05a,
      0x1fb,
      0x030,
      0x0e4,
      0x335,
      0x328,
      0x382, //  80
      0x310,
      0x297,
      0x273,
      0x17a,
      0x17e,
      0x106,
      0x17c,
      0x25a,
      0x2f2,
      0x150,
      0x059,
      0x266,
      0x057,
      0x1b0,
      0x29e,
      0x268, //  96
      0x09d,
      0x176,
      0x0f2,
      0x2d6,
      0x258,
      0x10d,
      0x177,
      0x382,
      0x34d,
      0x1c6,
      0x162,
      0x082,
      0x32e,
      0x24b,
      0x324,
      0x022, // 112
      0x0d3,
      0x14a,
      0x21b,
      0x129,
      0x33b,
      0x361,
      0x025,
      0x205,
      0x342,
      0x13b,
      0x226,
      0x056,
      0x321,
      0x004,
      0x06c,
      0x21b,
    ], // 128
    [
      // ECL 7 (256 factors) -----------------------------------------------------------------------------
      0x20c,
      0x37e,
      0x04b,
      0x2fe,
      0x372,
      0x359,
      0x04a,
      0x0cc,
      0x052,
      0x24a,
      0x2c4,
      0x0fa,
      0x389,
      0x312,
      0x08a,
      0x2d0, //  16
      0x35a,
      0x0c2,
      0x137,
      0x391,
      0x113,
      0x0be,
      0x177,
      0x352,
      0x1b6,
      0x2dd,
      0x0c2,
      0x118,
      0x0c9,
      0x118,
      0x33c,
      0x2f5, //  32
      0x2c6,
      0x32e,
      0x397,
      0x059,
      0x044,
      0x239,
      0x00b,
      0x0cc,
      0x31c,
      0x25d,
      0x21c,
      0x391,
      0x321,
      0x2bc,
      0x31f,
      0x089, //  48
      0x1b7,
      0x1a2,
      0x250,
      0x29c,
      0x161,
      0x35b,
      0x172,
      0x2b6,
      0x145,
      0x0f0,
      0x0d8,
      0x101,
      0x11c,
      0x225,
      0x0d1,
      0x374, //  64
      0x13b,
      0x046,
      0x149,
      0x319,
      0x1ea,
      0x112,
      0x36d,
      0x0a2,
      0x2ed,
      0x32c,
      0x2ac,
      0x1cd,
      0x14e,
      0x178,
      0x351,
      0x209, //  80
      0x133,
      0x123,
      0x323,
      0x2c8,
      0x013,
      0x166,
      0x18f,
      0x38c,
      0x067,
      0x1ff,
      0x033,
      0x008,
      0x205,
      0x0e1,
      0x121,
      0x1d6, //  96
      0x27d,
      0x2db,
      0x042,
      0x0ff,
      0x395,
      0x10d,
      0x1cf,
      0x33e,
      0x2da,
      0x1b1,
      0x350,
      0x249,
      0x088,
      0x21a,
      0x38a,
      0x05a, // 112
      0x002,
      0x122,
      0x2e7,
      0x0c7,
      0x28f,
      0x387,
      0x149,
      0x031,
      0x322,
      0x244,
      0x163,
      0x24c,
      0x0bc,
      0x1ce,
      0x00a,
      0x086, // 128
      0x274,
      0x140,
      0x1df,
      0x082,
      0x2e3,
      0x047,
      0x107,
      0x13e,
      0x176,
      0x259,
      0x0c0,
      0x25d,
      0x08e,
      0x2a1,
      0x2af,
      0x0ea, // 144
      0x2d2,
      0x180,
      0x0b1,
      0x2f0,
      0x25f,
      0x280,
      0x1c7,
      0x0c1,
      0x2b1,
      0x2c3,
      0x325,
      0x281,
      0x030,
      0x03c,
      0x2dc,
      0x26d, // 160
      0x37f,
      0x220,
      0x105,
      0x354,
      0x28f,
      0x135,
      0x2b9,
      0x2f3,
      0x2f4,
      0x03c,
      0x0e7,
      0x305,
      0x1b2,
      0x1a5,
      0x2d6,
      0x210, // 176
      0x1f7,
      0x076,
      0x031,
      0x31b,
      0x020,
      0x090,
      0x1f4,
      0x0ee,
      0x344,
      0x18a,
      0x118,
      0x236,
      0x13f,
      0x009,
      0x287,
      0x226, // 192
      0x049,
      0x392,
      0x156,
      0x07e,
      0x020,
      0x2a9,
      0x14b,
      0x318,
      0x26c,
      0x03c,
      0x261,
      0x1b9,
      0x0b4,
      0x317,
      0x37d,
      0x2f2, // 208
      0x25d,
      0x17f,
      0x0e4,
      0x2ed,
      0x2f8,
      0x0d5,
      0x036,
      0x129,
      0x086,
      0x036,
      0x342,
      0x12b,
      0x39a,
      0x0bf,
      0x38e,
      0x214, // 224
      0x261,
      0x33d,
      0x0bd,
      0x014,
      0x0a7,
      0x01d,
      0x368,
      0x1c1,
      0x053,
      0x192,
      0x029,
      0x290,
      0x1f9,
      0x243,
      0x1e1,
      0x0ad, // 240
      0x194,
      0x0fb,
      0x2b0,
      0x05f,
      0x1f1,
      0x22b,
      0x282,
      0x21f,
      0x133,
      0x09f,
      0x39c,
      0x22e,
      0x288,
      0x037,
      0x1f1,
      0x00a,
    ], // 256
    [
      // ECL 8 (512 factors) -----------------------------------------------------------------------------
      0x160,
      0x04d,
      0x175,
      0x1f8,
      0x023,
      0x257,
      0x1ac,
      0x0cf,
      0x199,
      0x23e,
      0x076,
      0x1f2,
      0x11d,
      0x17c,
      0x15e,
      0x1ec, //  16
      0x0c5,
      0x109,
      0x398,
      0x09b,
      0x392,
      0x12b,
      0x0e5,
      0x283,
      0x126,
      0x367,
      0x132,
      0x058,
      0x057,
      0x0c1,
      0x160,
      0x30d, //  32
      0x34e,
      0x04b,
      0x147,
      0x208,
      0x1b3,
      0x21f,
      0x0cb,
      0x29a,
      0x0f9,
      0x15a,
      0x30d,
      0x26d,
      0x280,
      0x10c,
      0x31a,
      0x216, //  48
      0x21b,
      0x30d,
      0x198,
      0x186,
      0x284,
      0x066,
      0x1dc,
      0x1f3,
      0x122,
      0x278,
      0x221,
      0x025,
      0x35a,
      0x394,
      0x228,
      0x029, //  64
      0x21e,
      0x121,
      0x07a,
      0x110,
      0x17f,
      0x320,
      0x1e5,
      0x062,
      0x2f0,
      0x1d8,
      0x2f9,
      0x06b,
      0x310,
      0x35c,
      0x292,
      0x2e5, //  80
      0x122,
      0x0cc,
      0x2a9,
      0x197,
      0x357,
      0x055,
      0x063,
      0x03e,
      0x1e2,
      0x0b4,
      0x014,
      0x129,
      0x1c3,
      0x251,
      0x391,
      0x08e, //  96
      0x328,
      0x2ac,
      0x11f,
      0x218,
      0x231,
      0x04c,
      0x28d,
      0x383,
      0x2d9,
      0x237,
      0x2e8,
      0x186,
      0x201,
      0x0c0,
      0x204,
      0x102, // 112
      0x0f0,
      0x206,
      0x31a,
      0x18b,
      0x300,
      0x350,
      0x033,
      0x262,
      0x180,
      0x0a8,
      0x0be,
      0x33a,
      0x148,
      0x254,
      0x312,
      0x12f, // 128
      0x23a,
      0x17d,
      0x19f,
      0x281,
      0x09c,
      0x0ed,
      0x097,
      0x1ad,
      0x213,
      0x0cf,
      0x2a4,
      0x2c6,
      0x059,
      0x0a8,
      0x130,
      0x192, // 144
      0x028,
      0x2c4,
      0x23f,
      0x0a2,
      0x360,
      0x0e5,
      0x041,
      0x35d,
      0x349,
      0x200,
      0x0a4,
      0x1dd,
      0x0dd,
      0x05c,
      0x166,
      0x311, // 160
      0x120,
      0x165,
      0x352,
      0x344,
      0x33b,
      0x2e0,
      0x2c3,
      0x05e,
      0x008,
      0x1ee,
      0x072,
      0x209,
      0x002,
      0x1f3,
      0x353,
      0x21f, // 176
      0x098,
      0x2d9,
      0x303,
      0x05f,
      0x0f8,
      0x169,
      0x242,
      0x143,
      0x358,
      0x31d,
      0x121,
      0x033,
      0x2ac,
      0x1d2,
      0x215,
      0x334, // 192
      0x29d,
      0x02d,
      0x386,
      0x1c4,
      0x0a7,
      0x156,
      0x0f4,
      0x0ad,
      0x023,
      0x1cf,
      0x28b,
      0x033,
      0x2bb,
      0x24f,
      0x1c4,
      0x242, // 208
      0x025,
      0x07c,
      0x12a,
      0x14c,
      0x228,
      0x02b,
      0x1ab,
      0x077,
      0x296,
      0x309,
      0x1db,
      0x352,
      0x2fc,
      0x16c,
      0x242,
      0x38f, // 224
      0x11b,
      0x2c7,
      0x1d8,
      0x1a4,
      0x0f5,
      0x120,
      0x252,
      0x18a,
      0x1ff,
      0x147,
      0x24d,
      0x309,
      0x2bb,
      0x2b0,
      0x02b,
      0x198, // 240
      0x34a,
      0x17f,
      0x2d1,
      0x209,
      0x230,
      0x284,
      0x2ca,
      0x22f,
      0x03e,
      0x091,
      0x369,
      0x297,
      0x2c9,
      0x09f,
      0x2a0,
      0x2d9, // 256
      0x270,
      0x03b,
      0x0c1,
      0x1a1,
      0x09e,
      0x0d1,
      0x233,
      0x234,
      0x157,
      0x2b5,
      0x06d,
      0x260,
      0x233,
      0x16d,
      0x0b5,
      0x304, // 272
      0x2a5,
      0x136,
      0x0f8,
      0x161,
      0x2c4,
      0x19a,
      0x243,
      0x366,
      0x269,
      0x349,
      0x278,
      0x35c,
      0x121,
      0x218,
      0x023,
      0x309, // 288
      0x26a,
      0x24a,
      0x1a8,
      0x341,
      0x04d,
      0x255,
      0x15a,
      0x10d,
      0x2f5,
      0x278,
      0x2b7,
      0x2ef,
      0x14b,
      0x0f7,
      0x0b8,
      0x02d, // 304
      0x313,
      0x2a8,
      0x012,
      0x042,
      0x197,
      0x171,
      0x036,
      0x1ec,
      0x0e4,
      0x265,
      0x33e,
      0x39a,
      0x1b5,
      0x207,
      0x284,
      0x389, // 320
      0x315,
      0x1a4,
      0x131,
      0x1b9,
      0x0cf,
      0x12c,
      0x37c,
      0x33b,
      0x08d,
      0x219,
      0x17d,
      0x296,
      0x201,
      0x038,
      0x0fc,
      0x155, // 336
      0x0f2,
      0x31d,
      0x346,
      0x345,
      0x2d0,
      0x0e0,
      0x133,
      0x277,
      0x03d,
      0x057,
      0x230,
      0x136,
      0x2f4,
      0x299,
      0x18d,
      0x328, // 352
      0x353,
      0x135,
      0x1d9,
      0x31b,
      0x17a,
      0x01f,
      0x287,
      0x393,
      0x1cb,
      0x326,
      0x24e,
      0x2db,
      0x1a9,
      0x0d8,
      0x224,
      0x0f9, // 368
      0x141,
      0x371,
      0x2bb,
      0x217,
      0x2a1,
      0x30e,
      0x0d2,
      0x32f,
      0x389,
      0x12f,
      0x34b,
      0x39a,
      0x119,
      0x049,
      0x1d5,
      0x317, // 384
      0x294,
      0x0a2,
      0x1f2,
      0x134,
      0x09b,
      0x1a6,
      0x38b,
      0x331,
      0x0bb,
      0x03e,
      0x010,
      0x1a9,
      0x217,
      0x150,
      0x11e,
      0x1b5, // 400
      0x177,
      0x111,
      0x262,
      0x128,
      0x0b7,
      0x39b,
      0x074,
      0x29b,
      0x2ef,
      0x161,
      0x03e,
      0x16e,
      0x2b3,
      0x17b,
      0x2af,
      0x34a, // 416
      0x025,
      0x165,
      0x2d0,
      0x2e6,
      0x14a,
      0x005,
      0x027,
      0x39b,
      0x137,
      0x1a8,
      0x0f2,
      0x2ed,
      0x141,
      0x036,
      0x29d,
      0x13c, // 432
      0x156,
      0x12b,
      0x216,
      0x069,
      0x29b,
      0x1e8,
      0x280,
      0x2a0,
      0x240,
      0x21c,
      0x13c,
      0x1e6,
      0x2d1,
      0x262,
      0x02e,
      0x290, // 448
      0x1bf,
      0x0ab,
      0x268,
      0x1d0,
      0x0be,
      0x213,
      0x129,
      0x141,
      0x2fa,
      0x2f0,
      0x215,
      0x0af,
      0x086,
      0x00e,
      0x17d,
      0x1b1, // 464
      0x2cd,
      0x02d,
      0x06f,
      0x014,
      0x254,
      0x11c,
      0x2e0,
      0x08a,
      0x286,
      0x19b,
      0x36d,
      0x29d,
      0x08d,
      0x397,
      0x02d,
      0x30c, // 480
      0x197,
      0x0a4,
      0x14c,
      0x383,
      0x0a5,
      0x2d6,
      0x258,
      0x145,
      0x1f2,
      0x28f,
      0x165,
      0x2f0,
      0x300,
      0x0df,
      0x351,
      0x287, // 496
      0x03f,
      0x136,
      0x35f,
      0x0fb,
      0x16e,
      0x130,
      0x11a,
      0x2e2,
      0x2a3,
      0x19a,
      0x185,
      0x0f4,
      0x01f,
      0x079,
      0x12f,
      0x107,
    ], // 512
  ],

  /**
   * This is the class constructor.
   * Creates a PDF417 object
   * @param code (string) code to represent using PDF417
   * @param ecl (int) error correction level (0-8); default -1 = automatic correction level
   * @param aspectratio (float) the width to height of the symbol (excluding quiet zones)
   */
  init: function (code, ecl, aspectratio) {
    code = unescape(encodeURIComponent(code)); // covert UTF-8 to ISO-8859-1
    ecl = ecl || -1;
    aspectratio = aspectratio || 2;
    this.barcode_array = {};
    if (code === "") {
      return false;
    }
    // get the input sequence array
    sequence = this.getInputSequences(code);
    codewords = []; // array of code-words
    for (var i = 0; i < sequence.length; i++) {
      var cw = this.getCompaction(sequence[i][0], sequence[i][1], true);
      codewords = codewords.concat(cw);
    }
    if (codewords[0] == 900) {
      // Text Alpha is the default mode, so remove the first code
      codewords.shift();
    }
    // count number of codewords
    var numcw = codewords.length;
    if (numcw > 925) {
      // reached maximum data codeword capacity
      return false;
    }

    // set error correction level
    ecl = this.getErrorCorrectionLevel(ecl, numcw);
    // number of codewords for error correction
    var errsize = 2 << ecl;
    // calculate number of columns (number of codewords per row) and rows
    var nce = numcw + errsize + 1;
    var cols = Math.round(
      (Math.sqrt(4761 + 68 * aspectratio * this.ROWHEIGHT * nce) - 69) / 34
    );
    // adjust cols
    if (cols < 1) {
      cols = 1;
    } else if (cols > 30) {
      cols = 30;
    }
    var rows = Math.ceil(nce / cols);
    var size = cols * rows;
    // adjust rows
    if (rows < 3 || rows > 90) {
      if (rows < 3) {
        rows = 3;
      } else if (rows > 90) {
        rows = 90;
      }
      cols = Math.ceil(size / rows);
      size = cols * rows;
    }
    if (size > 928) {
      // set dimensions to get maximum capacity
      if (
        Math.abs(aspectratio - (17 * 29) / 32) <
        Math.abs(aspectratio - (17 * 16) / 58)
      ) {
        cols = 29;
        rows = 32;
      } else {
        cols = 16;
        rows = 58;
      }
      size = 928;
    }
    // calculate padding
    var pad = size - nce;
    if (pad > 0) {
      if (size - rows == nce) {
        --rows;
        size -= rows;
      } else {
        // add pading
        codewords = codewords.concat(this._array_fill(0, pad, 900));
      }
    }

    // Symbol Length Descriptor (number of data codewords including Symbol Length Descriptor and pad codewords)
    var sld = size - errsize;
    // add symbol length description
    codewords.unshift(sld);
    // calculate error correction
    var ecw = this.getErrorCorrection(codewords, ecl);
    // add error correction codewords
    codewords = codewords.concat(ecw);
    // add horizontal quiet zones to start and stop patterns
    var pstart = this._str_repeat("0", this.QUIETH) + this.start_pattern;
    var pstop = this.stop_pattern + "" + this._str_repeat("0", this.QUIETH);
    this.barcode_array["num_rows"] = rows * this.ROWHEIGHT + 2 * this.QUIETV;
    this.barcode_array["num_cols"] = (cols + 2) * 17 + 35 + 2 * this.QUIETH;
    this.barcode_array["bcode"] = [];

    var empty_row;
    // build rows for vertical quiet zone
    if (this.QUIETV > 0) {
      empty_row = this._array_fill(0, this.barcode_array["num_cols"], 0);
      for (var i = 0; i < this.QUIETV; ++i) {
        // add vertical quiet rows
        this.barcode_array["bcode"].push(empty_row);
      }
    }

    var L;
    var k = 0; // codeword index
    var cid = 0; // initial cluster
    // for each row
    for (var r = 0; r < rows; ++r) {
      // row start code
      var row = pstart;
      switch (cid) {
        case 0: {
          L = 30 * this._intval(r / 3) + this._intval((rows - 1) / 3);
          break;
        }
        case 1: {
          L = 30 * this._intval(r / 3) + ecl * 3 + ((rows - 1) % 3);
          break;
        }
        case 2: {
          L = 30 * this._intval(r / 3) + (cols - 1);
          break;
        }
      }
      // left row indicator
      row += this._sprintf("%17b", this.clusters[cid][L]);
      // for each column
      for (var c = 0; c < cols; ++c) {
        row += this._sprintf("%17b", this.clusters[cid][codewords[k]]);
        ++k;
      }
      switch (cid) {
        case 0: {
          L = 30 * this._intval(r / 3) + (cols - 1);
          break;
        }
        case 1: {
          L = 30 * this._intval(r / 3) + this._intval((rows - 1) / 3);
          break;
        }
        case 2: {
          L = 30 * this._intval(r / 3) + ecl * 3 + ((rows - 1) % 3);
          break;
        }
      }
      // right row indicator
      row += this._sprintf("%17b", this.clusters[cid][L]);
      // row stop code
      row += pstop;
      // convert the string to array
      var arow = this._preg_split("//", row, -1, "PREG_SPLIT_NO_EMPTY");
      // duplicate row to get the desired height
      for (var h = 0; h < this.ROWHEIGHT; ++h) {
        this.barcode_array["bcode"].push(arow);
      }
      ++cid;
      if (cid > 2) {
        cid = 0;
      }
    }
    if (this.QUIETV > 0) {
      for (var i = 0; i < this.QUIETV; ++i) {
        // add vertical quiet rows
        this.barcode_array["bcode"].push(empty_row);
      }
    }
  },

  getInputSequences: function (code) {
    var sequence_array = []; // array to be returned
    var numseq = [];
    // get numeric sequences
    numseq = code.match(/([0-9]{13,44})/g);
    if (numseq == null) {
      numseq = [];
    } else {
      // add offset to each matched line
      for (var n = 0, offset = 0; n < numseq.length; n++) {
        offset = code.indexOf(numseq[n], offset);
        numseq[n] = [numseq[n], offset];
        offset += numseq[n][0].length;
      }
    }
    numseq.push(["", code.length]);
    var offset = 0;
    for (var i = 0; i < numseq.length; i++) {
      var seq = numseq[i];
      var seqlen = seq[0].length;
      if (seq[1] > 0) {
        // extract text sequence before the number sequence
        var prevseq = code.substr(offset, seq[1] - offset);
        var textseq = [];
        // get text sequences
        textseq = prevseq.match(/([\x09\x0a\x0d\x20-\x7e]{5,})/g);
        if (textseq == null) {
          textseq = [];
        } else {
          // add offset to each matched line
          for (var n = 0; n < textseq.length; n++) {
            var offset = prevseq.indexOf(textseq[n]);
            textseq[n] = [textseq[n], offset];
          }
        }
        textseq.push(["", prevseq.length]);
        var txtoffset = 0;
        for (var j = 0; j < textseq.length; j++) {
          var txtseq = textseq[j];
          var txtseqlen = txtseq[0].length;
          if (txtseq[1] > 0) {
            // extract byte sequence before the text sequence
            var prevtxtseq = prevseq.substr(txtoffset, txtseq[1] - txtoffset);
            if (prevtxtseq.length > 0) {
              // add BYTE sequence
              if (
                prevtxtseq.length == 1 &&
                sequence_array.length > 0 &&
                sequence_array[sequence_array.length - 1][0] == 900
              ) {
                sequence_array.push([913, prevtxtseq]);
              } else if (prevtxtseq.length % 6 == 0) {
                sequence_array.push([924, prevtxtseq]);
              } else {
                sequence_array.push([901, prevtxtseq]);
              }
            }
          }
          if (txtseqlen > 0) {
            // add numeric sequence
            sequence_array.push([900, txtseq[0]]);
          }
          txtoffset = txtseq[1] + txtseqlen;
        }
      }
      if (seqlen > 0) {
        // add numeric sequence
        sequence_array.push([902, seq[0]]);
      }
      offset = seq[1] + seqlen;
    }
    return sequence_array;
  },

  getCompaction: function (mode, code, addmode) {
    addmode = addmode || true;
    var cw = []; // array of codewords to return
    switch (mode) {
      case 900: {
        // Text Compaction mode latch
        var submode = 0; // default Alpha sub-mode
        var txtarr = []; // array of characters and sub-mode switching characters
        var codelen = code.length;
        for (var i = 0; i < codelen; ++i) {
          var chval = this._ord(code.charAt(i));
          var k;
          if (
            (k = this._array_search(chval, this.textsubmodes[submode])) !==
            false
          ) {
            // we are on the same sub-mode
            txtarr.push(k);
          } else {
            // the sub-mode is changed
            for (var s = 0; s < 4; ++s) {
              // search new sub-mode
              if (
                s != submode &&
                (k = this._array_search(chval, this.textsubmodes[s])) !== false
              ) {
                // s is the new submode
                if (
                  (i + 1 == codelen ||
                    (i + 1 < codelen &&
                      this._array_search(
                        this._ord(code.charAt(i + 1)),
                        this.textsubmodes[submode]
                      ) !== false)) &&
                  (s == 3 || (s == 0 && submode == 1))
                ) {
                  // shift (temporary change only for this char)
                  if (s == 3) {
                    // shift to puntuaction
                    txtarr.push(29);
                  } else {
                    // shift from lower to alpha
                    txtarr.push(27);
                  }
                } else {
                  // latch
                  txtarr = txtarr.concat(this.textlatch["" + submode + s]);
                  // set new submode
                  submode = s;
                }
                // add characted code to array
                txtarr.push(k);
                break;
              }
            }
          }
        }
        var txtarrlen = txtarr.length;
        if (txtarrlen % 2 != 0) {
          // add padding
          txtarr.push(29);
          ++txtarrlen;
        }
        // calculate codewords
        for (var i = 0; i < txtarrlen; i += 2) {
          cw.push(30 * parseInt(txtarr[i]) + parseInt(txtarr[i + 1]));
        }
        break;
      }
      case 901:
      case 924: {
        // Byte Compaction mode latch
        var rest;
        var sublen;
        var codelen;
        while ((codelen = code.length) > 0) {
          if (codelen > 6) {
            rest = code.substring(6);
            code = code.substring(0, 6);
            sublen = 6;
          } else {
            rest = "";
            sublen = code.length;
          }
          if (sublen == 6) {
            var t = bcmul("" + this._ord(code.charAt(0)), "1099511627776");
            t = bcadd(t, bcmul("" + this._ord(code.charAt(1)), "4294967296"));
            t = bcadd(t, bcmul("" + this._ord(code.charAt(2)), "16777216"));
            t = bcadd(t, bcmul("" + this._ord(code.charAt(3)), "65536"));
            t = bcadd(t, bcmul("" + this._ord(code.charAt(4)), "256"));
            t = bcadd(t, "" + this._ord(code.charAt(5)));
            // tmp array for the 6 bytes block
            var cw6 = [];
            do {
              var d = this._my_bcmod(t, "900");
              t = bcdiv(t, "900");
              // prepend the value to the beginning of the array
              cw6.unshift(d);
            } while (t != "0");
            // append the result array at the end
            cw = cw.concat(cw6);
          } else {
            for (var i = 0; i < sublen; ++i) {
              cw.push(this._ord(code.charAt(i)));
            }
          }
          code = rest;
        }
        break;
      }
      case 902: {
        // Numeric Compaction mode latch
        var rest;
        var codelen;
        while ((codelen = code.length) > 0) {
          if (codelen > 44) {
            rest = code.substring(44);
            code = code.substring(0, 44);
          } else {
            rest = "";
          }
          var t = "1" + code;
          do {
            var d = this._my_bcmod(t, "900");
            t = bcdiv(t, "900");
            cw.unshift(d);
          } while (t != "0");
          code = rest;
        }
        break;
      }
      case 913: {
        // Byte Compaction mode shift
        cw.push(this._ord(code));
        break;
      }
    }
    if (addmode) {
      // add the compaction mode codeword at the beginning
      cw.unshift(mode);
    }
    return cw;
  },

  getErrorCorrectionLevel: function (ecl, numcw) {
    // get maximum correction level
    var maxecl = 8; // starting error level
    var maxerrsize = 928 - numcw; // available codewords for error
    while (maxecl > 0) {
      var errsize = 2 << ecl;
      if (maxerrsize >= errsize) {
        break;
      }
      --maxecl;
    }
    // check for automatic levels
    if (ecl < 0 || ecl > 8) {
      if (numcw < 41) {
        ecl = 2;
      } else if (numcw < 161) {
        ecl = 3;
      } else if (numcw < 321) {
        ecl = 4;
      } else if (numcw < 864) {
        ecl = 5;
      } else {
        ecl = maxecl;
      }
    }
    if (ecl > maxecl) {
      ecl = maxecl;
    }
    return ecl;
  },

  getErrorCorrection: function (cw, ecl) {
    // get error correction coefficients
    var ecc = this.rsfactors[ecl];
    // number of error correction factors
    var eclsize = 2 << ecl;
    // maximum index for rsfactors[ecl]
    var eclmaxid = eclsize - 1;
    // initialize array of error correction codewords
    var ecw = this._array_fill(0, eclsize, 0);
    // for each data codeword
    for (var k = 0; k < cw.length; k++) {
      var t1 = (cw[k] + ecw[eclmaxid]) % 929;
      for (var j = eclmaxid; j > 0; --j) {
        var t2 = (t1 * ecc[j]) % 929;
        var t3 = 929 - t2;
        ecw[j] = (ecw[j - 1] + t3) % 929;
      }
      t2 = (t1 * ecc[0]) % 929;
      t3 = 929 - t2;
      ecw[0] = t3 % 929;
    }
    for (var j = 0; j < ecw.length; j++) {
      if (ecw[j] != 0) {
        ecw[j] = 929 - ecw[j];
      }
    }
    ecw = ecw.reverse();
    return ecw;
  },

  getBarcodeArray: function () {
    return this.barcode_array;
  },

  /**
   *
   * Functions from phpjs.org
   *
   */
  _array_fill: function (start_index, num, mixed_val) {
    var key,
      tmp_arr = {};

    if (start_index == 0) {
      var tmpArray = [];
      for (var i = 0; i < num; i++) {
        tmpArray.push(mixed_val);
      }
      return tmpArray;
    }

    if (!isNaN(start_index) && !isNaN(num)) {
      for (key = 0; key < num; key++) {
        tmp_arr[key + start_index] = mixed_val;
      }
    }

    return tmp_arr;
  },

  _str_repeat: function (input, multiplier) {
    // http://kevin.vanzonneveld.net
    // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   improved by: Jonas Raoni Soares Silva (http://www.jsfromhell.com)
    // +   improved by: Ian Carter (http://euona.com/)
    // *     example 1: str_repeat('-=', 10);
    // *     returns 1: '-=-=-=-=-=-=-=-=-=-='
    var y = "";
    while (true) {
      if (multiplier & 1) {
        y += input;
      }
      multiplier >>= 1;
      if (multiplier) {
        input += input;
      } else {
        break;
      }
    }
    return y;
  },

  _intval: function (mixed_var, base) {
    // http://kevin.vanzonneveld.net
    // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   improved by: stensi
    // +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   input by: Matteo
    // +   bugfixed by: Brett Zamir (http://brett-zamir.me)
    // +   bugfixed by: Rafał Kukawski (http://kukawski.pl)
    // *     example 1: intval('Kevin van Zonneveld');
    // *     returns 1: 0
    // *     example 2: intval(4.2);
    // *     returns 2: 4
    // *     example 3: intval(42, 8);
    // *     returns 3: 42
    // *     example 4: intval('09');
    // *     returns 4: 9
    // *     example 5: intval('1e', 16);
    // *     returns 5: 30
    var tmp;

    var type = typeof mixed_var;

    if (type === "boolean") {
      return +mixed_var;
    } else if (type === "string") {
      tmp = parseInt(mixed_var, base || 10);
      return isNaN(tmp) || !isFinite(tmp) ? 0 : tmp;
    } else if (type === "number" && isFinite(mixed_var)) {
      return mixed_var | 0;
    } else {
      return 0;
    }
  },

  _sprintf: function () {
    // http://kevin.vanzonneveld.net
    // +   original by: Ash Searle (http://hexmen.com/blog/)
    // + namespaced by: Michael White (http://getsprink.com)
    // +    tweaked by: Jack
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +      input by: Paulo Freitas
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +      input by: Brett Zamir (http://brett-zamir.me)
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   improved by: Dj
    // +   improved by: Allidylls
    // *     example 1: sprintf("%01.2f", 123.1);
    // *     returns 1: 123.10
    // *     example 2: sprintf("[%10s]", 'monkey');
    // *     returns 2: '[    monkey]'
    // *     example 3: sprintf("[%'#10s]", 'monkey');
    // *     returns 3: '[####monkey]'
    // *     example 4: sprintf("%d", 123456789012345);
    // *     returns 4: '123456789012345'
    var regex = /%%|%(\d+\$)?([-+\'#0 ]*)(\*\d+\$|\*|\d+)?(\.(\*\d+\$|\*|\d+))?([scboxXuideEfFgG])/g;
    var a = arguments,
      i = 0,
      format = a[i++];

    // pad()
    var pad = function (str, len, chr, leftJustify) {
      if (!chr) {
        chr = " ";
      }
      var padding =
        str.length >= len ? "" : Array((1 + len - str.length) >>> 0).join(chr);
      return leftJustify ? str + padding : padding + str;
    };

    // justify()
    var justify = function (
      value,
      prefix,
      leftJustify,
      minWidth,
      zeroPad,
      customPadChar
    ) {
      var diff = minWidth - value.length;
      if (diff > 0) {
        if (leftJustify || !zeroPad) {
          value = pad(value, minWidth, customPadChar, leftJustify);
        } else {
          value =
            value.slice(0, prefix.length) +
            pad("", diff, "0", true) +
            value.slice(prefix.length);
        }
      }
      return value;
    };

    // formatBaseX()
    var formatBaseX = function (
      value,
      base,
      prefix,
      leftJustify,
      minWidth,
      precision,
      zeroPad
    ) {
      // Note: casts negative numbers to positive ones
      var number = value >>> 0;
      prefix =
        (prefix &&
          number &&
          {
            "2": "0b",
            "8": "0",
            "16": "0x",
          }[base]) ||
        "";
      value = prefix + pad(number.toString(base), precision || 0, "0", false);
      return justify(value, prefix, leftJustify, minWidth, zeroPad);
    };

    // formatString()
    var formatString = function (
      value,
      leftJustify,
      minWidth,
      precision,
      zeroPad,
      customPadChar
    ) {
      if (precision != null) {
        value = value.slice(0, precision);
      }
      return justify(value, "", leftJustify, minWidth, zeroPad, customPadChar);
    };

    // doFormat()
    var doFormat = function (
      substring,
      valueIndex,
      flags,
      minWidth,
      _,
      precision,
      type
    ) {
      var number;
      var prefix;
      var method;
      var textTransform;
      var value;

      if (substring == "%%") {
        return "%";
      }

      // parse flags
      var leftJustify = false,
        positivePrefix = "",
        zeroPad = false,
        prefixBaseX = false,
        customPadChar = " ";
      var flagsl = flags.length;
      for (var j = 0; flags && j < flagsl; j++) {
        switch (flags.charAt(j)) {
          case " ":
            positivePrefix = " ";
            break;
          case "+":
            positivePrefix = "+";
            break;
          case "-":
            leftJustify = true;
            break;
          case "'":
            customPadChar = flags.charAt(j + 1);
            break;
          case "0":
            zeroPad = true;
            break;
          case "#":
            prefixBaseX = true;
            break;
        }
      }

      // parameters may be null, undefined, empty-string or real valued
      // we want to ignore null, undefined and empty-string values
      if (!minWidth) {
        minWidth = 0;
      } else if (minWidth == "*") {
        minWidth = +a[i++];
      } else if (minWidth.charAt(0) == "*") {
        minWidth = +a[minWidth.slice(1, -1)];
      } else {
        minWidth = +minWidth;
      }

      // Note: undocumented perl feature:
      if (minWidth < 0) {
        minWidth = -minWidth;
        leftJustify = true;
      }

      if (!isFinite(minWidth)) {
        throw new Error("sprintf: (minimum-)width must be finite");
      }

      if (!precision) {
        precision = "fFeE".indexOf(type) > -1 ? 6 : type == "d" ? 0 : undefined;
      } else if (precision == "*") {
        precision = +a[i++];
      } else if (precision.charAt(0) == "*") {
        precision = +a[precision.slice(1, -1)];
      } else {
        precision = +precision;
      }

      // grab value using valueIndex if required?
      value = valueIndex ? a[valueIndex.slice(0, -1)] : a[i++];

      switch (type) {
        case "s":
          return formatString(
            String(value),
            leftJustify,
            minWidth,
            precision,
            zeroPad,
            customPadChar
          );
        case "c":
          return formatString(
            String.fromCharCode(+value),
            leftJustify,
            minWidth,
            precision,
            zeroPad
          );
        case "b":
          return formatBaseX(
            value,
            2,
            prefixBaseX,
            leftJustify,
            minWidth,
            precision,
            zeroPad
          );
        case "o":
          return formatBaseX(
            value,
            8,
            prefixBaseX,
            leftJustify,
            minWidth,
            precision,
            zeroPad
          );
        case "x":
          return formatBaseX(
            value,
            16,
            prefixBaseX,
            leftJustify,
            minWidth,
            precision,
            zeroPad
          );
        case "X":
          return formatBaseX(
            value,
            16,
            prefixBaseX,
            leftJustify,
            minWidth,
            precision,
            zeroPad
          ).toUpperCase();
        case "u":
          return formatBaseX(
            value,
            10,
            prefixBaseX,
            leftJustify,
            minWidth,
            precision,
            zeroPad
          );
        case "i":
        case "d":
          number = +value || 0;
          number = Math.round(number - (number % 1)); // Plain Math.round doesn't just truncate
          prefix = number < 0 ? "-" : positivePrefix;
          value = prefix + pad(String(Math.abs(number)), precision, "0", false);
          return justify(value, prefix, leftJustify, minWidth, zeroPad);
        case "e":
        case "E":
        case "f": // Should handle locales (as per setlocale)
        case "F":
        case "g":
        case "G":
          number = +value;
          prefix = number < 0 ? "-" : positivePrefix;
          method = ["toExponential", "toFixed", "toPrecision"][
            "efg".indexOf(type.toLowerCase())
          ];
          textTransform = ["toString", "toUpperCase"][
            "eEfFgG".indexOf(type) % 2
          ];
          value = prefix + Math.abs(number)[method](precision);
          return justify(value, prefix, leftJustify, minWidth, zeroPad)[
            textTransform
          ]();
        default:
          return substring;
      }
    };

    return format.replace(regex, doFormat);
  },

  _preg_split: function (pattern, subject, limit, flags) {
    // http://kevin.vanzonneveld.net
    // + original by: Marco Marchiò
    // * example 1: preg_split(/[\s,]+/, 'hypertext language, programming');
    // * returns 1: ['hypertext', 'language', 'programming']
    // * example 2: preg_split('//', 'string', -1, 'PREG_SPLIT_NO_EMPTY');
    // * returns 2: ['s', 't', 'r', 'i', 'n', 'g']
    // * example 3: var str = 'hypertext language programming';
    // * example 3: preg_split('/ /', str, -1, 'PREG_SPLIT_OFFSET_CAPTURE');
    // * returns 3: [['hypertext', 0], ['language', 10], ['programming', 19]]
    // * example 4: preg_split('/( )/', '1 2 3 4 5 6 7 8', 4, 'PREG_SPLIT_DELIM_CAPTURE');
    // * returns 4: ['1', ' ', '2', ' ', '3', ' ', '4 5 6 7 8']
    // * example 5: preg_split('/( )/', '1 2 3 4 5 6 7 8', 4, (2 | 4));
    // * returns 5: [['1', 0], [' ', 1], ['2', 2], [' ', 3], ['3', 4], [' ', 5], ['4 5 6 7 8', 6]]

    limit = limit || 0;
    flags = flags || ""; // Limit and flags are optional

    var result,
      ret = [],
      index = 0,
      i = 0,
      noEmpty = false,
      delim = false,
      offset = false,
      OPTS = {},
      optTemp = 0,
      regexpBody = /^\/(.*)\/\w*$/.exec(pattern.toString())[1],
      regexpFlags = /^\/.*\/(\w*)$/.exec(pattern.toString())[1];
    // Non-global regexp causes an infinite loop when executing the while,
    // so if it's not global, copy the regexp and add the "g" modifier.
    pattern =
      pattern.global && typeof pattern !== "string"
        ? pattern
        : new RegExp(
            regexpBody,
            regexpFlags + (regexpFlags.indexOf("g") !== -1 ? "" : "g")
          );

    OPTS = {
      PREG_SPLIT_NO_EMPTY: 1,
      PREG_SPLIT_DELIM_CAPTURE: 2,
      PREG_SPLIT_OFFSET_CAPTURE: 4,
    };
    if (typeof flags !== "number") {
      // Allow for a single string or an array of string flags
      flags = [].concat(flags);
      for (i = 0; i < flags.length; i++) {
        // Resolve string input to bitwise e.g. 'PREG_SPLIT_OFFSET_CAPTURE' becomes 4
        if (OPTS[flags[i]]) {
          optTemp = optTemp | OPTS[flags[i]];
        }
      }
      flags = optTemp;
    }
    noEmpty = flags & OPTS.PREG_SPLIT_NO_EMPTY;
    delim = flags & OPTS.PREG_SPLIT_DELIM_CAPTURE;
    offset = flags & OPTS.PREG_SPLIT_OFFSET_CAPTURE;

    var _filter = function (str, strindex) {
      // If the match is empty and the PREG_SPLIT_NO_EMPTY flag is set don't add it
      if (noEmpty && !str.length) {
        return;
      }
      // If the PREG_SPLIT_OFFSET_CAPTURE flag is set
      // transform the match into an array and add the index at position 1
      if (offset) {
        str = [str, strindex];
      }
      ret.push(str);
    };
    // Special case for empty regexp
    if (!regexpBody) {
      result = subject.split("");
      for (i = 0; i < result.length; i++) {
        _filter(result[i], i);
      }
      return ret;
    }
    // Exec the pattern and get the result
    while ((result = pattern.exec(subject))) {
      // Stop if the limit is 1
      if (limit === 1) {
        break;
      }
      // Take the correct portion of the string and filter the match
      _filter(subject.slice(index, result.index), index);
      index = result.index + result[0].length;
      // If the PREG_SPLIT_DELIM_CAPTURE flag is set, every capture match must be included in the results array
      if (delim) {
        // Convert the regexp result into a normal array
        var resarr = Array.prototype.slice.call(result);
        for (i = 1; i < resarr.length; i++) {
          if (result[i] !== undefined) {
            _filter(result[i], result.index + result[0].indexOf(result[i]));
          }
        }
      }
      limit--;
    }
    // Filter last match
    _filter(subject.slice(index, subject.length), index);
    return ret;
  },

  _ord: function (string) {
    return string.charCodeAt(0);
  },

  _array_search: function (needle, haystack, argStrict) {
    // http://kevin.vanzonneveld.net
    // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +      input by: Brett Zamir (http://brett-zamir.me)
    // +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // *     example 1: array_search('zonneveld', {firstname: 'kevin', middle: 'van', surname: 'zonneveld'});
    // *     returns 1: 'surname'
    // *     example 2: ini_set('phpjs.return_phpjs_arrays', 'on');
    // *     example 2: var ordered_arr = array({3:'value'}, {2:'value'}, {'a':'value'}, {'b':'value'});
    // *     example 2: var key = array_search(/val/g, ordered_arr); // or var key = ordered_arr.search(/val/g);
    // *     returns 2: '3'

    var strict = !!argStrict,
      key = "";

    if (haystack && typeof haystack === "object" && haystack.change_key_case) {
      // Duck-type check for our own array()-created PHPJS_Array
      return haystack.search(needle, argStrict);
    }
    if (typeof needle === "object" && needle.exec) {
      // Duck-type for RegExp
      if (!strict) {
        // Let's consider case sensitive searches as strict
        var flags =
          "i" +
          (needle.global ? "g" : "") +
          (needle.multiline ? "m" : "") +
          (needle.sticky ? "y" : ""); // sticky is FF only
        needle = new RegExp(needle.source, flags);
      }
      for (key in haystack) {
        if (needle.test(haystack[key])) {
          return key;
        }
      }
      return false;
    }

    for (key in haystack) {
      if (
        (strict && haystack[key] === needle) ||
        (!strict && haystack[key] == needle)
      ) {
        return key;
      }
    }

    return false;
  },

  _my_bcmod: function (x, y) {
    // how many numbers to take at once? carefull not to exceed (int)
    var take = 5;
    var mod = "";
    do {
      var a = parseInt(mod + "" + x.substring(0, take));
      x = x.substring(take);
      mod = a % y;
    } while (x.length);

    return parseInt(mod);
  },
};

/**
 * Binary Calculator (BC) Arbitrary Precision Mathematics Lib v0.10  (LGPL)
 * Copy of libbcmath included in PHP5 src
 * supports bcadd, bcsub, bcmul, bcdiv, bccomp, bcscale, and new function bcround(val, precision)
 * See PHP Manual for parameters.. functions work identical to the PHP5 funcions
 * Feel free to use how-ever you want, just email any bug-fixes/improvements to the sourceforge project:
 *      https://sourceforge.net/projects/bcmath-js/
 *
 * Ported from the PHP5 bcmath extension source code,
 * which uses the libbcmath package...
 *    Copyright (C) 1991, 1992, 1993, 1994, 1997 Free Software Foundation, Inc.
 *    Copyright (C) 2000 Philip A. Nelson
 *     The Free Software Foundation, Inc.
 *     59 Temple Place, Suite 330
 *     Boston, MA 02111-1307 USA.
 *      e-mail:  philnelson@acm.org
 *     us-mail:  Philip A. Nelson
 *               Computer Science Department, 9062
 *               Western Washington University
 *               Bellingham, WA 98226-9062
 */
var libbcmath = {
  PLUS: "+",
  MINUS: "-",
  BASE: 10,
  scale: 0,
  bc_num: function () {
    this.n_sign = null;
    this.n_len = null;
    this.n_scale = null;
    this.n_value = null;
    this.toString = function () {
      var b, a;
      a = this.n_value.join("");
      b =
        (this.n_sign == libbcmath.PLUS ? "" : this.n_sign) +
        a.substr(0, this.n_len);
      if (this.n_scale > 0) {
        b += "." + a.substr(this.n_len, this.n_scale);
      }
      return b;
    };
    this.setScale = function (a) {
      while (this.n_scale < a) {
        this.n_value.push(0);
        this.n_scale++;
      }
      while (this.n_scale > a) {
        this.n_value.pop();
        this.n_scale--;
      }
      return this;
    };
  },
  bc_new_num: function (b, c) {
    var a;
    a = new libbcmath.bc_num();
    a.n_sign = libbcmath.PLUS;
    a.n_len = b;
    a.n_scale = c;
    a.n_value = libbcmath.safe_emalloc(1, b + c, 0);
    libbcmath.memset(a.n_value, 0, 0, b + c);
    return a;
  },
  safe_emalloc: function (c, b, a) {
    return Array(c * b + a);
  },
  bc_init_num: function () {
    return new libbcmath.bc_new_num(1, 0);
  },
  _bc_rm_leading_zeros: function (a) {
    while (a.n_value[0] === 0 && a.n_len > 1) {
      a.n_value.shift();
      a.n_len--;
    }
  },
  php_str2num: function (b) {
    var a;
    a = b.indexOf(".");
    if (a == -1) {
      return libbcmath.bc_str2num(b, 0);
    } else {
      return libbcmath.bc_str2num(b, b.length - a);
    }
  },
  CH_VAL: function (a) {
    return a - "0";
  },
  BCD_CHAR: function (a) {
    return a + "0";
  },
  isdigit: function (a) {
    return isNaN(parseInt(a, 10)) ? false : true;
  },
  bc_str2num: function (h, c) {
    var g, f, a, b, e, i, d;
    g = h.split("");
    a = 0;
    b = 0;
    e = 0;
    i = false;
    if (g[a] === "+" || g[a] === "-") {
      a++;
    }
    while (g[a] === "0") {
      a++;
    }
    while (g[a] % 1 === 0) {
      a++;
      b++;
    }
    if (g[a] === ".") {
      a++;
    }
    while (g[a] % 1 === 0) {
      a++;
      e++;
    }
    if (g[a] || b + e === 0) {
      return libbcmath.bc_init_num();
    }
    e = libbcmath.MIN(e, c);
    if (b === 0) {
      i = true;
      b = 1;
    }
    f = libbcmath.bc_new_num(b, e);
    a = 0;
    if (g[a] === "-") {
      f.n_sign = libbcmath.MINUS;
      a++;
    } else {
      f.n_sign = libbcmath.PLUS;
      if (g[a] === "+") {
        a++;
      }
    }
    while (g[a] === "0") {
      a++;
    }
    d = 0;
    if (i) {
      f.n_value[d++] = 0;
      b = 0;
    }
    for (; b > 0; b--) {
      f.n_value[d++] = libbcmath.CH_VAL(g[a++]);
    }
    if (e > 0) {
      a++;
      for (; e > 0; e--) {
        f.n_value[d++] = libbcmath.CH_VAL(g[a++]);
      }
    }
    return f;
  },
  cint: function (b) {
    if (typeof b == "undefined") {
      b = 0;
    }
    var a = parseInt(b, 10);
    if (isNaN(a)) {
      a = 0;
    }
    return a;
  },
  MIN: function (d, c) {
    return d > c ? c : d;
  },
  MAX: function (d, c) {
    return d > c ? d : c;
  },
  ODD: function (b) {
    return b & 1;
  },
  memset: function (d, e, c, a) {
    var b;
    for (b = 0; b < a; b++) {
      d[e + b] = c;
    }
  },
  memcpy: function (b, f, e, d, a) {
    var c;
    for (c = 0; c < a; c++) {
      b[f + c] = e[d + c];
    }
    return true;
  },
  bc_is_zero: function (a) {
    var b;
    var c;
    b = a.n_len + a.n_scale;
    c = 0;
    while (b > 0 && a.n_value[c++] === 0) {
      b--;
    }
    if (b !== 0) {
      return false;
    } else {
      return true;
    }
  },
  bc_out_of_memory: function () {
    throw new Error("(BC) Out of memory");
  },
};
libbcmath.bc_add = function (f, d, c) {
  var e, b, a;
  if (f.n_sign === d.n_sign) {
    e = libbcmath._bc_do_add(f, d, c);
    e.n_sign = f.n_sign;
  } else {
    b = libbcmath._bc_do_compare(f, d, false, false);
    switch (b) {
      case -1:
        e = libbcmath._bc_do_sub(d, f, c);
        e.n_sign = d.n_sign;
        break;
      case 0:
        a = libbcmath.MAX(c, libbcmath.MAX(f.n_scale, d.n_scale));
        e = libbcmath.bc_new_num(1, a);
        libbcmath.memset(e.n_value, 0, 0, a + 1);
        break;
      case 1:
        e = libbcmath._bc_do_sub(f, d, c);
        e.n_sign = f.n_sign;
    }
  }
  return e;
};
libbcmath.bc_compare = function (b, a) {
  return libbcmath._bc_do_compare(b, a, true, false);
};
libbcmath._bc_do_compare = function (e, d, c, b) {
  var g, a;
  var f;
  if (c && e.n_sign != d.n_sign) {
    if (e.n_sign == libbcmath.PLUS) {
      return 1;
    } else {
      return -1;
    }
  }
  if (e.n_len != d.n_len) {
    if (e.n_len > d.n_len) {
      if (!c || e.n_sign == libbcmath.PLUS) {
        return 1;
      } else {
        return -1;
      }
    } else {
      if (!c || e.n_sign == libbcmath.PLUS) {
        return -1;
      } else {
        return 1;
      }
    }
  }
  f = e.n_len + Math.min(e.n_scale, d.n_scale);
  g = 0;
  a = 0;
  while (f > 0 && e.n_value[g] == d.n_value[a]) {
    g++;
    a++;
    f--;
  }
  if (b && f == 1 && e.n_scale == d.n_scale) {
    return 0;
  }
  if (f !== 0) {
    if (e.n_value[g] > d.n_value[a]) {
      if (!c || e.n_sign == libbcmath.PLUS) {
        return 1;
      } else {
        return -1;
      }
    } else {
      if (!c || e.n_sign == libbcmath.PLUS) {
        return -1;
      } else {
        return 1;
      }
    }
  }
  if (e.n_scale != d.n_scale) {
    if (e.n_scale > d.n_scale) {
      for (f = e.n_scale - d.n_scale; f > 0; f--) {
        if (e.n_value[g++] !== 0) {
          if (!c || e.n_sign == libbcmath.PLUS) {
            return 1;
          } else {
            return -1;
          }
        }
      }
    } else {
      for (f = d.n_scale - e.n_scale; f > 0; f--) {
        if (d.n_value[a++] !== 0) {
          if (!c || e.n_sign == libbcmath.PLUS) {
            return -1;
          } else {
            return 1;
          }
        }
      }
    }
  }
  return 0;
};
libbcmath._one_mult = function (d, e, i, f, j, c) {
  var h, g;
  var b, a;
  if (f === 0) {
    libbcmath.memset(j, 0, 0, i);
  } else {
    if (f == 1) {
      libbcmath.memcpy(j, c, d, e, i);
    } else {
      b = e + i - 1;
      a = c + i - 1;
      h = 0;
      while (i-- > 0) {
        g = d[b--] * f + h;
        j[a--] = g % libbcmath.BASE;
        h = Math.floor(g / libbcmath.BASE);
      }
      if (h != 0) {
        j[a] = h;
      }
    }
  }
};
libbcmath.bc_divide = function (l, k, z) {
  var y;
  var w;
  var c, b;
  var p, o, h, x;
  var u, A;
  var j, i, s, q, a, g;
  var r, m, t, v;
  var e;
  var n;
  var f;
  var d;
  if (libbcmath.bc_is_zero(k)) {
    return -1;
  }
  if (libbcmath.bc_is_zero(l)) {
    return libbcmath.bc_new_num(1, z);
  }
  if (k.n_scale === 0) {
    if (k.n_len === 1 && k.n_value[0] === 1) {
      w = libbcmath.bc_new_num(l.n_len, z);
      w.n_sign = l.n_sign == k.n_sign ? libbcmath.PLUS : libbcmath.MINUS;
      libbcmath.memset(w.n_value, l.n_len, 0, z);
      libbcmath.memcpy(
        w.n_value,
        0,
        l.n_value,
        0,
        l.n_len + libbcmath.MIN(l.n_scale, z)
      );
    }
  }
  s = k.n_scale;
  h = k.n_len + s - 1;
  while (s > 0 && k.n_value[h--] === 0) {
    s--;
  }
  j = l.n_len + s;
  u = l.n_scale - s;
  if (u < z) {
    a = z - u;
  } else {
    a = 0;
  }
  c = libbcmath.safe_emalloc(1, l.n_len + l.n_scale, a + 2);
  if (c === null) {
    libbcmath.bc_out_of_memory();
  }
  libbcmath.memset(c, 0, 0, l.n_len + l.n_scale + a + 2);
  libbcmath.memcpy(c, 1, l.n_value, 0, l.n_len + l.n_scale);
  i = k.n_len + s;
  b = libbcmath.safe_emalloc(1, i, 1);
  if (b === null) {
    libbcmath.bc_out_of_memory();
  }
  libbcmath.memcpy(b, 0, k.n_value, 0, i);
  b[i] = 0;
  h = 0;
  while (b[h] === 0) {
    h++;
    i--;
  }
  if (i > j + z) {
    q = z + 1;
    n = true;
  } else {
    n = false;
    if (i > j) {
      q = z + 1;
    } else {
      q = j - i + z + 1;
    }
  }
  w = libbcmath.bc_new_num(q - z, z);
  libbcmath.memset(w.n_value, 0, 0, q);
  e = libbcmath.safe_emalloc(1, i, 1);
  if (e === null) {
    libbcmath.bc_out_of_memory();
  }
  if (!n) {
    f = Math.floor(10 / (k.n_value[h] + 1));
    if (f != 1) {
      libbcmath._one_mult(c, 0, j + u + a + 1, f, c, 0);
      libbcmath._one_mult(k.n_value, h, i, f, k.n_value, h);
    }
    r = 0;
    if (i > j) {
      x = i - j;
    } else {
      x = 0;
    }
    while (r <= j + z - i) {
      if (k.n_value[h] == c[r]) {
        m = 9;
      } else {
        m = Math.floor((c[r] * 10 + c[r + 1]) / k.n_value[h]);
      }
      if (
        k.n_value[h + 1] * m >
        (c[r] * 10 + c[r + 1] - k.n_value[h] * m) * 10 + c[r + 2]
      ) {
        m--;
        if (
          k.n_value[h + 1] * m >
          (c[r] * 10 + c[r + 1] - k.n_value[h] * m) * 10 + c[r + 2]
        ) {
          m--;
        }
      }
      t = 0;
      if (m !== 0) {
        e[0] = 0;
        libbcmath._one_mult(k.n_value, h, i, m, e, 1);
        p = r + i;
        o = i;
        for (g = 0; g < i + 1; g++) {
          if (o < 0) {
            A = c[p] - 0 - t;
          } else {
            A = c[p] - e[o--] - t;
          }
          if (A < 0) {
            A += 10;
            t = 1;
          } else {
            t = 0;
          }
          c[p--] = A;
        }
      }
      if (t == 1) {
        m--;
        p = r + i;
        o = i - 1;
        v = 0;
        for (g = 0; g < i; g++) {
          if (o < 0) {
            A = c[p] + 0 + v;
          } else {
            A = c[p] + k.n_value[o--] + v;
          }
          if (A > 9) {
            A -= 10;
            v = 1;
          } else {
            v = 0;
          }
          c[p--] = A;
        }
        if (v == 1) {
          c[p] = (c[p] + 1) % 10;
        }
      }
      w.n_value[x++] = m;
      r++;
    }
  }
  w.n_sign = l.n_sign == k.n_sign ? libbcmath.PLUS : libbcmath.MINUS;
  if (libbcmath.bc_is_zero(w)) {
    w.n_sign = libbcmath.PLUS;
  }
  libbcmath._bc_rm_leading_zeros(w);
  return w;
};
libbcmath._bc_do_add = function (h, g, i) {
  var f;
  var c, b;
  var k, e, j;
  var m, l, a;
  var d;
  c = libbcmath.MAX(h.n_scale, g.n_scale);
  b = libbcmath.MAX(h.n_len, g.n_len) + 1;
  f = libbcmath.bc_new_num(b, libbcmath.MAX(c, i));
  l = h.n_scale;
  a = g.n_scale;
  k = h.n_len + l - 1;
  e = g.n_len + a - 1;
  j = c + b - 1;
  if (l != a) {
    if (l > a) {
      while (l > a) {
        f.n_value[j--] = h.n_value[k--];
        l--;
      }
    } else {
      while (a > l) {
        f.n_value[j--] = g.n_value[e--];
        a--;
      }
    }
  }
  l += h.n_len;
  a += g.n_len;
  m = 0;
  while (l > 0 && a > 0) {
    d = h.n_value[k--] + g.n_value[e--] + m;
    if (d >= libbcmath.BASE) {
      m = 1;
      d -= libbcmath.BASE;
    } else {
      m = 0;
    }
    f.n_value[j] = d;
    j--;
    l--;
    a--;
  }
  if (l === 0) {
    while (a-- > 0) {
      d = g.n_value[e--] + m;
      if (d >= libbcmath.BASE) {
        m = 1;
        d -= libbcmath.BASE;
      } else {
        m = 0;
      }
      f.n_value[j--] = d;
    }
  } else {
    while (l-- > 0) {
      d = h.n_value[k--] + m;
      if (d >= libbcmath.BASE) {
        m = 1;
        d -= libbcmath.BASE;
      } else {
        m = 0;
      }
      f.n_value[j--] = d;
    }
  }
  if (m == 1) {
    f.n_value[j] += 1;
  }
  libbcmath._bc_rm_leading_zeros(f);
  return f;
};
libbcmath._bc_do_sub = function (h, g, i) {
  var l;
  var m, a;
  var d, f;
  var k, c, n;
  var j, e, b;
  a = libbcmath.MAX(h.n_len, g.n_len);
  m = libbcmath.MAX(h.n_scale, g.n_scale);
  f = libbcmath.MIN(h.n_len, g.n_len);
  d = libbcmath.MIN(h.n_scale, g.n_scale);
  l = libbcmath.bc_new_num(a, libbcmath.MAX(m, i));
  k = h.n_len + h.n_scale - 1;
  c = g.n_len + g.n_scale - 1;
  n = a + m - 1;
  j = 0;
  if (h.n_scale != d) {
    for (e = h.n_scale - d; e > 0; e--) {
      l.n_value[n--] = h.n_value[k--];
    }
  } else {
    for (e = g.n_scale - d; e > 0; e--) {
      b = 0 - g.n_value[c--] - j;
      if (b < 0) {
        b += libbcmath.BASE;
        j = 1;
      } else {
        j = 0;
        l.n_value[n--] = b;
      }
    }
  }
  for (e = 0; e < f + d; e++) {
    b = h.n_value[k--] - g.n_value[c--] - j;
    if (b < 0) {
      b += libbcmath.BASE;
      j = 1;
    } else {
      j = 0;
    }
    l.n_value[n--] = b;
  }
  if (a != f) {
    for (e = a - f; e > 0; e--) {
      b = h.n_value[k--] - j;
      if (b < 0) {
        b += libbcmath.BASE;
        j = 1;
      } else {
        j = 0;
      }
      l.n_value[n--] = b;
    }
  }
  libbcmath._bc_rm_leading_zeros(l);
  return l;
};
libbcmath.MUL_BASE_DIGITS = 80;
libbcmath.MUL_SMALL_DIGITS = libbcmath.MUL_BASE_DIGITS / 4;
libbcmath.bc_multiply = function (f, d, h) {
  var c;
  var b, a;
  var g, e;
  b = f.n_len + f.n_scale;
  a = d.n_len + d.n_scale;
  g = f.n_scale + d.n_scale;
  e = libbcmath.MIN(g, libbcmath.MAX(h, libbcmath.MAX(f.n_scale, d.n_scale)));
  c = libbcmath._bc_rec_mul(f, b, d, a, g);
  c.n_sign = f.n_sign == d.n_sign ? libbcmath.PLUS : libbcmath.MINUS;
  c.n_len = a + b + 1 - g;
  c.n_scale = e;
  libbcmath._bc_rm_leading_zeros(c);
  if (libbcmath.bc_is_zero(c)) {
    c.n_sign = libbcmath.PLUS;
  }
  return c;
};
libbcmath.new_sub_num = function (b, d, c) {
  var a = new libbcmath.bc_num();
  a.n_sign = libbcmath.PLUS;
  a.n_len = b;
  a.n_scale = d;
  a.n_value = c;
  return a;
};
libbcmath._bc_simp_mul = function (i, b, h, m, a) {
  var j;
  var k, c, f;
  var n, l;
  var e, g, d;
  d = b + m + 1;
  j = libbcmath.bc_new_num(d, 0);
  n = b - 1;
  l = m - 1;
  f = d - 1;
  g = 0;
  for (e = 0; e < d - 1; e++) {
    k = n - libbcmath.MAX(0, e - m + 1);
    c = l - libbcmath.MIN(e, m - 1);
    while (k >= 0 && c <= l) {
      g += i.n_value[k--] * h.n_value[c++];
    }
    j.n_value[f--] = Math.floor(g % libbcmath.BASE);
    g = Math.floor(g / libbcmath.BASE);
  }
  j.n_value[f] = g;
  return j;
};
libbcmath._bc_shift_addsub = function (b, g, a, d) {
  var c, h;
  var e, f;
  e = g.n_len;
  if (g.n_value[0] === 0) {
    e--;
  }
  if (!(b.n_len + b.n_scale >= a + e)) {
    throw new Error("len + scale < shift + count");
  }
  c = b.n_len + b.n_scale - a - 1;
  h = g.n_len = 1;
  f = 0;
  if (d) {
    while (e--) {
      b.n_value[c] -= g.n_value[h--] + f;
      if (b.n_value[c] < 0) {
        f = 1;
        b.n_value[c--] += libbcmath.BASE;
      } else {
        f = 0;
        c--;
      }
    }
    while (f) {
      b.n_value[c] -= f;
      if (b.n_value[c] < 0) {
        b.n_value[c--] += libbcmath.BASE;
      } else {
        f = 0;
      }
    }
  } else {
    while (e--) {
      b.n_value[c] += g.n_value[h--] + f;
      if (b.n_value[c] > libbcmath.BASE - 1) {
        f = 1;
        b.n_value[c--] -= libbcmath.BASE;
      } else {
        f = 0;
        c--;
      }
    }
    while (f) {
      b.n_value[c] += f;
      if (b.n_value[c] > libbcmath.BASE - 1) {
        b.n_value[c--] -= libbcmath.BASE;
      } else {
        f = 0;
      }
    }
  }
  return true;
};
libbcmath._bc_rec_mul = function (m, i, l, j, c) {
  var k;
  var s, r, h, g;
  var f, p;
  var d, b, a, y, x;
  var o, w, e;
  var q, t;
  if (
    i + j < libbcmath.MUL_BASE_DIGITS ||
    i < libbcmath.MUL_SMALL_DIGITS ||
    j < libbcmath.MUL_SMALL_DIGITS
  ) {
    return libbcmath._bc_simp_mul(m, i, l, j, c);
  }
  o = Math.floor((libbcmath.MAX(i, j) + 1) / 2);
  if (i < o) {
    r = libbcmath.bc_init_num();
    s = libbcmath.new_sub_num(i, 0, m.n_value);
  } else {
    r = libbcmath.new_sub_num(i - o, 0, m.n_value);
    s = libbcmath.new_sub_num(o, 0, m.n_value + i - o);
  }
  if (j < o) {
    g = libbcmath.bc_init_num();
    h = libbcmath.new_sub_num(j, 0, l.n_value);
  } else {
    g = libbcmath.new_sub_num(j - o, 0, l.n_value);
    h = libbcmath.new_sub_num(o, 0, l.n_value + j - o);
  }
  libbcmath._bc_rm_leading_zeros(r);
  libbcmath._bc_rm_leading_zeros(s);
  f = s.n_len;
  libbcmath._bc_rm_leading_zeros(g);
  libbcmath._bc_rm_leading_zeros(h);
  p = h.n_len;
  e = libbcmath.bc_is_zero(r) || libbcmath.bc_is_zero(g);
  y = libbcmath.bc_init_num();
  x = libbcmath.bc_init_num();
  y = libbcmath.bc_sub(r, s, 0);
  q = y.n_len;
  x = libbcmath.bc_sub(h, g, 0);
  t = x.n_len;
  if (e) {
    d = libbcmath.bc_init_num();
  } else {
    d = libbcmath._bc_rec_mul(r, r.n_len, g, g.n_len, 0);
  }
  if (libbcmath.bc_is_zero(y) || libbcmath.bc_is_zero(x)) {
    b = libbcmath.bc_init_num();
  } else {
    b = libbcmath._bc_rec_mul(y, q, x, t, 0);
  }
  if (libbcmath.bc_is_zero(s) || libbcmath.bc_is_zero(h)) {
    a = libbcmath.bc_init_num();
  } else {
    a = libbcmath._bc_rec_mul(s, s.n_len, h, h.n_len, 0);
  }
  w = i + j + 1;
  k = libbcmath.bc_new_num(w, 0);
  if (!e) {
    libbcmath._bc_shift_addsub(k, d, 2 * o, 0);
    libbcmath._bc_shift_addsub(k, d, o, 0);
  }
  libbcmath._bc_shift_addsub(k, a, o, 0);
  libbcmath._bc_shift_addsub(k, a, 0, 0);
  libbcmath._bc_shift_addsub(k, b, o, y.n_sign != x.n_sign);
  return k;
};
libbcmath.bc_sub = function (e, d, c) {
  var f;
  var b, a;
  if (e.n_sign != d.n_sign) {
    f = libbcmath._bc_do_add(e, d, c);
    f.n_sign = e.n_sign;
  } else {
    b = libbcmath._bc_do_compare(e, d, false, false);
    switch (b) {
      case -1:
        f = libbcmath._bc_do_sub(d, e, c);
        f.n_sign =
          d.n_sign == libbcmath.PLUS ? libbcmath.MINUS : libbcmath.PLUS;
        break;
      case 0:
        a = libbcmath.MAX(c, libbcmath.MAX(e.n_scale, d.n_scale));
        f = libbcmath.bc_new_num(1, a);
        libbcmath.memset(f.n_value, 0, 0, a + 1);
        break;
      case 1:
        f = libbcmath._bc_do_sub(e, d, c);
        f.n_sign = e.n_sign;
        break;
    }
  }
  return f;
};
function bcadd(b, d, f) {
  var e, c, a;
  if (typeof f == "undefined") {
    f = libbcmath.scale;
  }
  f = f < 0 ? 0 : f;
  e = libbcmath.bc_init_num();
  c = libbcmath.bc_init_num();
  a = libbcmath.bc_init_num();
  e = libbcmath.php_str2num(b.toString());
  c = libbcmath.php_str2num(d.toString());
  if (e.n_scale > c.n_scale) {
    c.setScale(e.n_scale);
  }
  if (c.n_scale > e.n_scale) {
    e.setScale(c.n_scale);
  }
  a = libbcmath.bc_add(e, c, f);
  if (a.n_scale > f) {
    a.n_scale = f;
  }
  return a.toString();
}
function bcsub(b, d, f) {
  var e, c, a;
  if (typeof f == "undefined") {
    f = libbcmath.scale;
  }
  f = f < 0 ? 0 : f;
  e = libbcmath.bc_init_num();
  c = libbcmath.bc_init_num();
  a = libbcmath.bc_init_num();
  e = libbcmath.php_str2num(b.toString());
  c = libbcmath.php_str2num(d.toString());
  if (e.n_scale > c.n_scale) {
    c.setScale(e.n_scale);
  }
  if (c.n_scale > e.n_scale) {
    e.setScale(c.n_scale);
  }
  a = libbcmath.bc_sub(e, c, f);
  if (a.n_scale > f) {
    a.n_scale = f;
  }
  return a.toString();
}
function bccomp(a, c, e) {
  var d, b;
  if (typeof e == "undefined") {
    e = libbcmath.scale;
  }
  e = e < 0 ? 0 : e;
  d = libbcmath.bc_init_num();
  b = libbcmath.bc_init_num();
  d = libbcmath.bc_str2num(a.toString(), e);
  b = libbcmath.bc_str2num(c.toString(), e);
  return libbcmath.bc_compare(d, b, e);
}
function bcscale(a) {
  a = parseInt(a, 10);
  if (isNaN(a)) {
    return false;
  }
  if (a < 0) {
    return false;
  }
  libbcmath.scale = a;
  return true;
}
function bcdiv(b, d, f) {
  var e, c, a;
  if (typeof f == "undefined") {
    f = libbcmath.scale;
  }
  f = f < 0 ? 0 : f;
  e = libbcmath.bc_init_num();
  c = libbcmath.bc_init_num();
  a = libbcmath.bc_init_num();
  e = libbcmath.php_str2num(b.toString());
  c = libbcmath.php_str2num(d.toString());
  if (e.n_scale > c.n_scale) {
    c.setScale(e.n_scale);
  }
  if (c.n_scale > e.n_scale) {
    e.setScale(c.n_scale);
  }
  a = libbcmath.bc_divide(e, c, f);
  if (a === -1) {
    throw new Error(11, "(BC) Division by zero");
  }
  if (a.n_scale > f) {
    a.n_scale = f;
  }
  return a.toString();
}
function bcmul(b, d, f) {
  var e, c, a;
  if (typeof f == "undefined") {
    f = libbcmath.scale;
  }
  f = f < 0 ? 0 : f;
  e = libbcmath.bc_init_num();
  c = libbcmath.bc_init_num();
  a = libbcmath.bc_init_num();
  e = libbcmath.php_str2num(b.toString());
  c = libbcmath.php_str2num(d.toString());
  if (e.n_scale > c.n_scale) {
    c.setScale(e.n_scale);
  }
  if (c.n_scale > e.n_scale) {
    e.setScale(c.n_scale);
  }
  a = libbcmath.bc_multiply(e, c, f);
  if (a.n_scale > f) {
    a.n_scale = f;
  }
  return a.toString();
}
function bcround(d, b) {
  var a, c;
  a = "0." + Array(b + 1).join("0") + "5";
  if (d.toString().substring(0, 1) == "-") {
    a = "-" + a;
  }
  c = bcadd(d, a, b);
  return c;
}
