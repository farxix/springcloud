package com.router.util.keygen;

public class UnicodeUtf {
	
	/**
     * utf-8 转unicode
     * 
     * @param inStr
     * @return String
     */
    public static String utf8ToUnicode(String inStr) {
//        char[] myBuffer = inStr.toCharArray();

        StringBuffer unicode = new StringBuffer();
        for (int i = 0; i < inStr.length(); i++) {
            // 取出每一个字符
            char c = inStr.charAt(i);
            String str = Integer.toHexString(c);
            switch (4 - str.length()) {
                case 0:
                    unicode.append("\\u" + str);
                    break;
                case 1:
                    str = "0" + str;
                    unicode.append("\\u" + str);
                    break;
                case 2:
                    str = "00" + str;
                    unicode.append("\\u" + str);
                    break;
                case 3:
                default:
                    str = String.valueOf(c);
                    unicode.append(str);
                    break;
            }
        }
        return unicode.toString();
    }

//        for (int i = 0; i < inStr.length(); i++) {
//            UnicodeBlock ub = UnicodeBlock.of(myBuffer[i]);
//            if (ub == UnicodeBlock.BASIC_LATIN) {
//                sb.append(myBuffer[i]);
//            } else if (ub == UnicodeBlock.HALFWIDTH_AND_FULLWIDTH_FORMS) {
//                int j = (int) myBuffer[i] - 65248;
//                sb.append((char) j);
//            } else {
//                short s = (short) myBuffer[i];
//                String hexS = Integer.toHexString(s);
//                if(hexS.startsWith("ffff")&&!hexS.equals("ffff")){
//					hexS = hexS.substring(4);
//				}
//                String unicode = "\\u" + hexS;
//                sb.append(unicode.toLowerCase());
//            }
//        }
//        return sb.toString();
//    }

    /**
     *
     * @param theString
     * @return String
     */
    public static String unicodeToUtf8(String theString) {
        char aChar;
        int len = theString.length();
        StringBuffer outBuffer = new StringBuffer(len);
        for (int x = 0; x < len;) {
            aChar = theString.charAt(x++);
            if (aChar == '\\') {
                aChar = theString.charAt(x++);
                if (aChar == 'u') {
                    // Read the xxxx
                    int value = 0;
                    for (int i = 0; i < 4; i++) {
                        aChar = theString.charAt(x++);
                        switch (aChar) {
                        case '0':
                        case '1':
                        case '2':
                        case '3':
                        case '4':
                        case '5':
                        case '6':
                        case '7':
                        case '8':
                        case '9':
                            value = (value << 4) + aChar - '0';
                            break;
                        case 'a':
                        case 'b':
                        case 'c':
                        case 'd':
                        case 'e':
                        case 'f':
                            value = (value << 4) + 10 + aChar - 'a';
                            break;
                        case 'A':
                        case 'B':
                        case 'C':
                        case 'D':
                        case 'E':
                        case 'F':
                            value = (value << 4) + 10 + aChar - 'A';
                            break;
                        default:
                            throw new IllegalArgumentException(
                                    "Malformed   \\uxxxx   encoding.");
                        }
                    }
                    outBuffer.append((char) value);
                } else {
                    if (aChar == 't')
                        aChar = '\t';
                    else if (aChar == 'r')
                        aChar = '\r';
                    else if (aChar == 'n')
                        aChar = '\n';
                    else if (aChar == 'f')
                        aChar = '\f';
                    outBuffer.append(aChar);
                }
            } else
                outBuffer.append(aChar);
        }
        return outBuffer.toString();
    }



}
