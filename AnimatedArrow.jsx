#target aftereffects
#targetengine "animatedArrowMVP"

(function animatedArrowPanel(thisObj) {
    var SCRIPT_NAME = "Animated Arrow";
    var DEFAULT_STROKE_WIDTH = 3;
    var DEFAULT_HEAD_SIZE = 27;
    var DEFAULT_DURATION = 0.5;
    var TILE_WIDTH = 26;
    var TILE_HEIGHT = 24;
    var selectedColor = [1, 1, 1];
    var selectedColorIsMixed = false;
    var isSyncingControls = false;
    var isRunningPanelAction = false;

    // Tile icon PNGs embedded as binary strings by tools/make_icons.py.
    var ICON_PNG = {};
    /*__ICON_DATA_BEGIN__*/
    ICON_PNG["style_triangle_off"] = "\x89PNG\x0D\x0A\x1A\x0A\x00\x00\x00\x0DIHDR\x00\x00\x00\x1A\x00\x00\x00\x18\x08\x06\x00\x00\x00\xE4\x82\xED\xC5\x00\x00\x00\xA6IDATx\xDA\xED\xD6\xB1\x09\xC4 \x18\x86a\xA7\xB1\x10\xEC\x14,\x9C\xC0*8\x81\x9DS\xB8\x81\x9D\x9D\xCBe\x94?~\x01!pw\\\x13\x7FR$\xF0v\xC1'\x88F\x85\x18\x8Fsn\x1B\xED#\xBA9\x8C\xB9\x89\x89XkI)ER\xCA[\xC3\x98\x18\xFB\xC4\xA0\xAE@\xAE\x18\x0C@\xCB\x90\x19\x8C\x17:\xF3\xDE\xF3@\xBDw\xCA9\x93\xD6z=\x84Zk\x14c\\\x0F\xCDJ)d\x8CY\x0F\xCDRJ_\xA7\xF3\x03\xC2\x8B\xF8\xBA\x7F\xFD\x82P\xAD\x95B\x08\x0F\x81\xD8\xA6\xEE\xB1\x8B\x81ey\xB3lX\xB6_\xD0{LL\x88\xED(\xE7\xB9\x9Cp]\xB7\x0E_\x14\xE2\xDEh\x10\x9D$\x00\x00\x00\x00IEND\xAEB`\x82";
    ICON_PNG["style_triangle_on"] = "\x89PNG\x0D\x0A\x1A\x0A\x00\x00\x00\x0DIHDR\x00\x00\x00\x1A\x00\x00\x00\x18\x08\x06\x00\x00\x00\xE4\x82\xED\xC5\x00\x00\x00\xA8IDATx\xDAc`\x00\x82\xF8\xDE\x1D\x01@|\x1F\x88\xFFS\x19\x83\xCC\x0C`\x80Y\x12\xD1\xB4\xEA\xBFSB\xDD\x7F\xCB\xC0l\xAAb\x90\x99 \xB3\xC1\x96\x81l\xA5\x85%\xC8\x96\x81\xEC\x00YD3K`\x18d\xC7\xA8E`\x1CW\xD4N\x1F\x8B@`\xC5\xE6}\xFF]cJho\x11\x08|\xFE\xF2\xED\x7F\xF3\xA4E\xB4\xB7\x08\x06\xCE]\xB9\xF5?(\xBD\x8E\xF6\x16\xC1\xC0\x9C\x15[\xB1\x06'\x86E \x85 \xD7\x11\xC2\xF8\xC0\xB3\x97o\xFE\x97\xB7\xCF\x1C$\x16\xD1-\xE8\x06mb\xA0K\xF2\xA6K\x86\xA5[\x114ZM\xC0,\xA2[UN\x9F\xC6\x09\xBD\x9A[\x00\":yL\x04\xE1\xE8\xD3\x00\x00\x00\x00IEND\xAEB`\x82";
    ICON_PNG["style_circle_off"] = "\x89PNG\x0D\x0A\x1A\x0A\x00\x00\x00\x0DIHDR\x00\x00\x00\x1A\x00\x00\x00\x18\x08\x06\x00\x00\x00\xE4\x82\xED\xC5\x00\x00\x00\xA4IDATx\xDA\xED\xD6=\x0A\xC4 \x10\x05`Oc!X\x0A\xF6^ x\x02Oa\xE7)\xEC\xBC\xDC\x1Ee\xD6\x17pIR\x98f2\x9B\xC2\xC0#\xA80\x1F\x88\x7FJ\xF5\xCF{\xBF\xF5|z\x889\xA8\xB9\xA9\x818\xE7\xC8\x18CZk\xD6\xA0&j\xEF\x18\xD4'\x90#\x06\x03\xD0c\xC8\x08\x8C\x05\xFD\x07\xB2\xD6R\x8C\x91RJ\xFB\x1Fmv\x08\x85k\xAD\xD4Z\xFB\x05m\xF4\xB3A!\x84\x13p\x0D\xC6Y\xA0\x9C\xF3\x14\xC2\xF8\x14\xC2\\\x97Rn3CF\xDE\x01\x89M\xDD\xEB\x16\x83\xD8\xF2\x16\xDD\xB0\xEBP\x15\x85\xC4\xAEr\x99\xC7\x89\xD4s\xEB\x0B#z\xF6L\xBA\xDA\xA6\xD2\x00\x00\x00\x00IEND\xAEB`\x82";
    ICON_PNG["style_circle_on"] = "\x89PNG\x0D\x0A\x1A\x0A\x00\x00\x00\x0DIHDR\x00\x00\x00\x1A\x00\x00\x00\x18\x08\x06\x00\x00\x00\xE4\x82\xED\xC5\x00\x00\x00\xA3IDATx\xDAc`\x00\x82\xF8\xDE\x1D\x01@|\x1F\x88\xFFS\x19\x83\xCC\x0C`\x80Y\x12\xD1\xB4\xEA\xBFSB\xDD\x7F\xCB\xC0l\xAAb\x90\x99 \xB3\xC1\x96\x81l\xA5\x85%\xC8\x96\x81\xEC\x00YD3K`\x18d\xC7\xA8E\x03c\x91kL\xC9\xFF\xE6I\x8B\xFE\xCFY\xB1\x15L\x83\xF8T\xB7\x08d\xF0\xE7/\xDF\xFE#\x03\x10\x1F$N5\x8B\xB2j&\xFC\xC7\x07@\xF2T\xB1\xE8\xE0\xC9\x8Bx-\x02\xC9\xE3\xB5\x08\x14\xD6\xE7\xAE\xDC\"\x88\x89\x01\x83\xC3\"\xBA\x05\xDD\xA0K\x0CtK\xDEt\xCD\xB0\xA3\x85*]-\xA2[UN\x9F\xC6\x09\xBD\x9A[\x00/\x7F\x966@h\x9B\x87\x00\x00\x00\x00IEND\xAEB`\x82";
    ICON_PNG["style_chevron_off"] = "\x89PNG\x0D\x0A\x1A\x0A\x00\x00\x00\x0DIHDR\x00\x00\x00\x1A\x00\x00\x00\x18\x08\x06\x00\x00\x00\xE4\x82\xED\xC5\x00\x00\x00\xB6IDATx\xDA\xED\x96=\x0A\xC4 \x10F=M\x0A\xC1.\x82\xBD\x9DU\xF0\x04v\x9E\"\x9D\xA5\x9D\x9D\x97\xDB\xA3\xCC\xFA\x09.\xBB\xEC\x92f\xE3\x90\"\xC2\xEB\x86y\xF21\xFE\x08\xD1\x961fk<\x1At2\xE8\xB9\x89!\xD1Z\x93\x94\x92\x96e9\x15\xF4D\xEF.\x83u\x86\xE4]\x06\x07D\xD3$\x038nQg]W\x1EQ\x08\x81b\x8C\xA4\x94\x9A\x1F]\xCE\x99J)\xE4\xBD\x9F+\x82\xA0\xD6\xDA\xD9\xF7\xFD0\xCE\xBF\x87!\xA5\xF4\x92\x01D\xFA+\xCE/\x11\x0A\xB1\xBB#P3\xEA\xAD\xB5\x1F\"\x80H\x9Ds\x17\x11\xB1Ew\xC9a`\x19o\xB6\x03\xCBv\x05\xDD\xCF\xC4\x10\xB1=\xE5<\x9F\x13\xAE\xEF\xD6\x13\xEC\xC8\xCB\xC2\x17\xCD\x8E\x8A\x00\x00\x00\x00IEND\xAEB`\x82";
    ICON_PNG["style_chevron_on"] = "\x89PNG\x0D\x0A\x1A\x0A\x00\x00\x00\x0DIHDR\x00\x00\x00\x1A\x00\x00\x00\x18\x08\x06\x00\x00\x00\xE4\x82\xED\xC5\x00\x00\x00\xB9IDATx\xDAc`\x00\x82\xF8\xDE\x1D\x01@|\x1F\x88\xFFS\x19\x83\xCC\x0C`\x80Y\x12\xD1\xB4\xEA\xBFSB\xDD\x7F\xCB\xC0l\xAAb\x90\x99 \xB3\xC1\x96\x81l\xA5\x85%\xC8\x96\x81\xEC\x00YD3K`\x18d\xC7\xA8E`\x1C\x94^G\x1F\x8B\xE6\xAC\xD8\xFA\x7F\xC5\xE6}\xFF]cJh\x1Ft\xCF^\xBE\xF9\xFF\xF9\xCB\xB7\xFF\xCD\x93\x16\xD1\xD6\"\x90\x050p\xEE\xCA-\xBC\xC1Iqb\xB8u\xEF\xF1\x7Fd\x00\x0ARl\xC1\x89a\x11H!\xC8u\xF80H\x0DL}V\xCD\x84\xFF\xE8\x00\x14\xA4\xE5\xED3\x07\x89Et\x0B\xBAA\x99\x18\xE8\x92\xBC\xE9\x96a\xE9V\x04\x8DV\x130\x8B\xE8V\x95\xD3\xA7qB\xAF\xE6\x16\x00sBV\xBC\xADh\xF8\xAC\x00\x00\x00\x00IEND\xAEB`\x82";
    ICON_PNG["style_diamond_off"] = "\x89PNG\x0D\x0A\x1A\x0A\x00\x00\x00\x0DIHDR\x00\x00\x00\x1A\x00\x00\x00\x18\x08\x06\x00\x00\x00\xE4\x82\xED\xC5\x00\x00\x00\x96IDATx\xDA\xED\xD6\xC1\x09\xC0 \x0C\x05P\xA7\xF1\xE0]\xF0\xEE\x02\xE2\x04N\xE0\x06\xDE\x9C\xC2\xE5:Jj\x0A\x81\xD2\xD6\xF6\xD0\x1A{P\xF8\xD7<\x90\x18#D=\xC6\x18W\xB3\xD4\xC0\xC7\xC1\x9AN\x10\xA2\xB5\x06\xA5\x14H)?\x0D\xD6\xC4\xDA\x1B\x86j\x0Fd\x8F\xA1\x81P7\x84\x82\xC6\x84\xC6B\xD6\xDA\xFEP\x8C\x11J)\xE0\xBD\xEF\x07\x11Bia\xAF\xA0#r\x87\x9D\xA0\x10\x02\xA4\x94\x1E\x93s\xBEDZ\xD88\x88\xED\xEA~\xD9\x0C\xAC\xED\xCD\xFA`\xE7Pe\x81\xD8\xBEr\x9E\xE5\x84k\xDDZ\x01\x0F2\xD7&\xCA)\xF1\xB5\x00\x00\x00\x00IEND\xAEB`\x82";
    ICON_PNG["style_diamond_on"] = "\x89PNG\x0D\x0A\x1A\x0A\x00\x00\x00\x0DIHDR\x00\x00\x00\x1A\x00\x00\x00\x18\x08\x06\x00\x00\x00\xE4\x82\xED\xC5\x00\x00\x00\x98IDATx\xDAc`\x00\x82\xF8\xDE\x1D\x01@|\x1F\x88\xFFS\x19\x83\xCC\x0C`\x80Y\x12\xD1\xB4\xEA\xBFSB\xDD\x7F\xCB\xC0l\xAAb\x90\x99 \xB3\xC1\x96\x81l\xA5\x85%\xC8\x96\x81\xEC\x00YD3K`\x18d\xC7\xA8E\x03kQV\xCD\x04\xDA[\xB4u\xDF\x89\xFF \xD0<i\x11\xED,\x82Y\x02\x03\xB8,\xA3\xC8\"tK\xF0Y\x86a\xD1\x9C\x15[\xFF\x9F\xBBr\x8B \xBEu\xEF\xF1\x7F|\x00\xDD\xB2\x81\xB3\x88nA7(\x13\x03]\x937]3\xECh\xA1J\x17\x8B\xE8V\x95\xD3\xA7qB\xAF\xE6\x16\x00\xE6\xBEg\xC4a\x85\x00\"\x00\x00\x00\x00IEND\xAEB`\x82";
    ICON_PNG["at_end_off"] = "\x89PNG\x0D\x0A\x1A\x0A\x00\x00\x00\x0DIHDR\x00\x00\x00\x1A\x00\x00\x00\x18\x08\x06\x00\x00\x00\xE4\x82\xED\xC5\x00\x00\x00\x9CIDATx\xDA\xED\xD61\x0A\x80 \x14\xC6qO\xE3 8\x0A\x0EnnN\x1D\xC1\xCDSx\x0377/\xD7Q^~\x81\x10\xD1\xD0\x90\xAF\x86\x82\xFF\xFA~$Z\x0A\xD1\x1Fk\xED\xD2[{\xF4p\x98\xB9\x88\x81\x18cH)ER\xCAG\xC3L\xCC\xDE1\xA83\x90#\x06\x03\xD04d\x04\xE3\x87\xDE\x81\x9Cs<Pk\x8Db\x8C\xA4\xB5\x9E\x0F\xA1R\x0Ay\xEF\xE7C\xA3\x94\xD2\xE5\xDB]BX\x8A\x9C\xF3\xAD\xCE\x10\xAA\xB5R\x08\xE1C\x10\xDB\xD2}v3\xB0lo\xB6\x03\xFB\x7FT\xD9 \xB6_9\xCF\xE5\x84\xEB\xBA\xB5\x01\xCF\x88\xCCp\xE6\xC4L1\x00\x00\x00\x00IEND\xAEB`\x82";
    ICON_PNG["at_end_on"] = "\x89PNG\x0D\x0A\x1A\x0A\x00\x00\x00\x0DIHDR\x00\x00\x00\x1A\x00\x00\x00\x18\x08\x06\x00\x00\x00\xE4\x82\xED\xC5\x00\x00\x00\x9DIDATx\xDAc`\x00\x82\xF8\xDE\x1D\x01@|\x1F\x88\xFFS\x19\x83\xCC\x0C`\x80Y\x12\xD1\xB4\xEA\xBFSB\xDD\x7F\xCB\xC0l\xAAb\x90\x99 \xB3\xC1\x96\x81l\xA5\x85%\xC8\x96\x81\xEC\x00YD3K`\x18d\xC7\xA8E\x03cQ\\Q;},\x02\x819+\xB6\xFEw\x8D)\xA1\xBDE \xF0\xEC\xE5\x9B\xFFY5\x13ho\x11\x0C\xAC\xD8\xBC\x0F\xAB\xEF\xB0Z\x04\x0A\x8AsWn\x11\x85\xB1\x81\xCF_\xBE\xFD/o\x9F9\x88,\xA2[\xD0\x0D\xDA\xC4@\x97\xE4M\xB7\x0C;Z\xA8\xD2\xCD\"\xBAU\xE5\xF4i\x9C\xD0\xAB\xB9\x05\x00\xE0_W\xC6\xA9?%\xDD\x00\x00\x00\x00IEND\xAEB`\x82";
    ICON_PNG["at_start_off"] = "\x89PNG\x0D\x0A\x1A\x0A\x00\x00\x00\x0DIHDR\x00\x00\x00\x1A\x00\x00\x00\x18\x08\x06\x00\x00\x00\xE4\x82\xED\xC5\x00\x00\x00\x9DIDATx\xDA\xED\xD6=\x0A\xC0 \x0C\x05`O\xE3 8\x0A\x0EnnN=\x82\x9B\xA7\xF0\x06nn^\xAEGI}\x85\x96B\x97\x0EM\xE8P\xE1\xAD\xF90\xF8\x13\xA5\xE6\xF2\xDE/3\xEB\x0C\xBD\x1C\xD4\\\xD4\x818\xE7\xC8\x18CZ\xEBW\x83\x9A\xA8\xBDcP9\x90+\x06\x03\x10\x1Br\x04\xC6\x0F\xF1C!\x04^\xC8ZK9g\x1Ac\xF0A1Fj\xAD\xED\x08\x0B\x84]\x94RN\x80\x05J)Q\xEF\xFD\x86 \xB5\xD6GA\xAB\xBF\x03\x89\xB5N\xF40\x88\x1Fo\xD1\x0B\xFB?\xAA\x9F\x80\xC4\xBEr\x99\xE1Dj\xDC\xDA\x00^,\xCCp\xE3^\xCE\xD1\x00\x00\x00\x00IEND\xAEB`\x82";
    ICON_PNG["at_start_on"] = "\x89PNG\x0D\x0A\x1A\x0A\x00\x00\x00\x0DIHDR\x00\x00\x00\x1A\x00\x00\x00\x18\x08\x06\x00\x00\x00\xE4\x82\xED\xC5\x00\x00\x00\xA1IDATx\xDAc`\x00\x82\xF8\xDE\x1D\x01@|\x1F\x88\xFFS\x19\x83\xCC\x0C`\x80Y\x12\xD1\xB4\xEA\xBFSB\xDD\x7F\xCB\xC0l\xAAb\x90\x99 \xB3\xC1\x96\x81l\xA5\x85%\xC8\x96\x81\xEC\x00YD3K`\x18d\xC7\xA8E\xB4\xB7(\xAE\xA8\x9D\xB6\x16\xB9\xC6\x94\xFC\x9F\xB3b\xEB\x7F\x10\xA0\x99EY5\x13\xFE?{\xF9\xE6?\x0CP\xDD\"\x90/Vl\xDE\xF7\x1F\x1DP\xD5\xA2\xF2\xF6\x99\xFF?\x7F\xF9\xF6\x1F\x1B8w\xE5\x16Q\x18\x14\xD4\x83\xC7\"\xBA\x05\x1D]\x13\x03\xDD\x937]3\xECh\xA1:(,\xA2[UN\x9F\xC6\x09\xBD\x9A[\x00.\xA1W\xC6\xFC\x93h\xC9\x00\x00\x00\x00IEND\xAEB`\x82";
    ICON_PNG["ease_linear_off"] = "\x89PNG\x0D\x0A\x1A\x0A\x00\x00\x00\x0DIHDR\x00\x00\x00\x1A\x00\x00\x00\x18\x08\x06\x00\x00\x00\xE4\x82\xED\xC5\x00\x00\x00\xDAIDATx\xDA\xE5\xD61\x0E\x830\x0C@QN\xC3\x80\xC4\x88\xC4\x90-\x17@\xD98\x01\x1B#'\xC8\x0D\xB2q\xB9\x1E%\xCD\x8F\x94\x8A\xA1mJ\x13#UE\xF2\xEA'\xDB1I\xD3\x84o\x1C\xC7)\xC4-\x84\xAF\x1C\xE4\x9C\x9A\x84\x0C\xC3\xE0\xBB\xAE\xF3m\xDBV\x0Dr\x92;b\xA8\x12\xC8\x11\xC3\x00\x12CR`\xFC&\xA4\xB5\x96\x85\xFA\xBE\xF7\xDB\xB6\xF9}\xDF\x9FbU \x10kmD\x96e\x91\xA9H)\xE5\x9Ds\x111\xC6\xC8\xCC\x88\xC4 \xC4\xAB\xD9\x14C\xF3<\xC7*h\x19U\x89\x9C\xBAu]\x1F\x08\xF3\xA9~\xBC\x8FC\x07\x13\xD9#\xDA\x93\x10\xDA&\xB2\xB0\x0C:\x0D\xFD\xDD\xC9*\x82HL\x15 \x9F\x0C\xFD+\x88\xE5;;\xF4\xD3\x10\xED\x02\xE1\xB7R\x8Ad+\xCA-\xE1\x7F\\\x139\xE8\xB2\xAB\xFC\x9A\xC7\xC9U\xCF\xAD;w>\xB3\xA4\xE8{\xFE\x19\x00\x00\x00\x00IEND\xAEB`\x82";
    ICON_PNG["ease_linear_on"] = "\x89PNG\x0D\x0A\x1A\x0A\x00\x00\x00\x0DIHDR\x00\x00\x00\x1A\x00\x00\x00\x18\x08\x06\x00\x00\x00\xE4\x82\xED\xC5\x00\x00\x00\xE6IDATx\xDAc`\x00\x82\xF8\xDE\x1D\x01@|\x1F\x88\xFFS\x19\x83\xCC\x0C`\x80Y\x12\xD1\xB4\xEA\xBFSB\xDD\x7F\xCB\xC0l\xAAb\x90\x99 \xB3\xC1\x96\x81l\xA5\x85%\xC8\x96\x81\xEC\x00YD3K`\x18d\xC7\xD0\xB4(\xABf\x02m-r\x8D)\xF9\x7F\xF0\xE4\xC5\xFF \x80\xCD2\xAAX\x04\xB2\xE4\xD6\xBD\xC7`KVl\xDEG\x1B\x1F\xC5\x15\xB5\xFF\xFF\xFC\xE5\x1B\xD8\x92\xE6I\x8Bh\x13G \x83A\x96\x800\xAE\xB8\xA1\xD8\xA2\x09s\xD7\x80}\x01\x0A2\x90\xAFh\x92\xEA\xB6\xEE;\x01\xB7\x04\x14?TO\xDE\xC8\x91\x0E\xB2\x8C&\xF9\x08\x14<0K@\xC1F\x93\x0C\x0B\x8AhX\xA4\xE3KY\x14Y\x042\x18\x04@\x96\x10\x13\xE9dY\x04\xCA|\xA4F:\xC9\x16\x81\x82\x0B\x04@\xC5\x0A\xA5\x96\x10\xF4\x11\xA1L82\xAA\x09B\x16\xD1\xAD*\xA7O\xE3\x84^\xCD-\x00\x85\xB72\x9E\xA9\x11\x838\x00\x00\x00\x00IEND\xAEB`\x82";
    ICON_PNG["ease_easy_off"] = "\x89PNG\x0D\x0A\x1A\x0A\x00\x00\x00\x0DIHDR\x00\x00\x00\x1A\x00\x00\x00\x18\x08\x06\x00\x00\x00\xE4\x82\xED\xC5\x00\x00\x00\xD6IDATx\xDA\xE5\x96=\x0A\xC4 \x10\x85=M\x0A\xC1R\xB0\xF7\x02i\xED<\x81\xA5\x9D\x9D7\xB0\xF3r{\x94Y\x9F l\xB1?1\x9B\x11\x96\x0D<\xD2\xCD\xA7\xEF\x8D\xA3B\xB4\xCF\x18\xB37\xDD\x9A\xE8b\xA1\xE6.\x06DkMRJ\xDA\xB6\xEDR\xA1&jw\x18\xA8\x1C\x90G\x18\x18\x00\xB1A\x86\xC0\xF8=\x90\xB5\xB6\x8B\x0D\xE4\xBD\xA7R\x0A\xD5Z\xBB\x9E\xC1\xBE\x02)\xA5(\xC6\xD8\x8B\xA7\x94\xC89\xC7\xB3\xA3\x10B\x87\xE0\xCF\x96\x11V\x7F\x14r\x1A\x04\xCB\x90I\xCE\x99\xB7\xEB\x86e\xAF\xF2\xB8\x04\x84\xE23\x96\x9D\x06\xC1.\xD8\x06\xFB\xD8@\xC324\x02\xDBd\x98i\xE5i\x10\xF2\xC0\xEAq\x18\x01\xC1\xE1\x9C\xB5\xEC#h\x84\x0E!\x13\x8C\x19\xB6\xA1\xFAnH\xFE\xC75q\x04\xB4\xEC*_\xF38Y\xF5\xDC\xBA\x03F\xFB\xB5\xA2\xA0\xB9\x0A\x85\x00\x00\x00\x00IEND\xAEB`\x82";
    ICON_PNG["ease_easy_on"] = "\x89PNG\x0D\x0A\x1A\x0A\x00\x00\x00\x0DIHDR\x00\x00\x00\x1A\x00\x00\x00\x18\x08\x06\x00\x00\x00\xE4\x82\xED\xC5\x00\x00\x00\xE1IDATx\xDAc`\x00\x82\xF8\xDE\x1D\x01@|\x1F\x88\xFFS\x19\x83\xCC\x0C`\x80Y\x12\xD1\xB4\xEA\xBFSB\xDD\x7F\xCB\xC0l\xAAb\x90\x99 \xB3\xC1\x96\x81l\xA5\x85%\xC8\x96\x81\xEC\x00YD3K`\x18d\xC7\xD0\xB3(\xABf\x02\x18\xD3\xCC\xA29+\xB6\xFE\xFF\xFC\xE5\xDB\x7F\x18\xC0f\x19E\x16\xB9\xC6\x94\xFC?x\xF2\"\xD8\xF0sWn\xFD\x9F0w\x0Dm|\xB4u\xDF\x09\xB0% \x9Afq\x04r=\xB1\x96\x90m\x11(\xC8@qr\xEB\xDEc\xDA\xA6:X\x90\xE1\x8A\x0F\xAAX\x042\x9C\x94 #\xDB\"Pp\x81\x82\x0D\x14|4\xB3\x08\x16d\xA0\x84@\xB3\x92\x81\x94\xA4L\xB2E\xA0\xF8\x00\xB9\x1E\x94\x19A\x00\x949I\x0D2\x82\x16\xC1\"\x1D\x04@q\x02*fhV\xA8\xE2+$GF5A\x8CEt\xAB\xCA\xE9\xD38\xA1Ws\x0B\x00\xB8\xB35\xB4]\xA3]\xE3\x00\x00\x00\x00IEND\xAEB`\x82";
    ICON_PNG["ease_in_off"] = "\x89PNG\x0D\x0A\x1A\x0A\x00\x00\x00\x0DIHDR\x00\x00\x00\x1A\x00\x00\x00\x18\x08\x06\x00\x00\x00\xE4\x82\xED\xC5\x00\x00\x00\xD9IDATx\xDA\xDD\x96\xAD\x0E\xC3 \x14\x85\xFB4\x15$u4\xA9\xC7\xA1\xFA\x088\x1C\xB2\x0E\x87\xC4\xE1\xFAr{\x94;\x0E\x09\xCB\xC4\x96\xB1\x96\xDBd#9\xA15\xE7\xCB=\\~\x86!\x8FeY\xD6\xAC[\x16u\x16<\xD7\xA1B\xE6y&!\x04\x8D\xE3\xD8U\xF0\x84w\x81\x81\xCA\x01y\x86\x81\x01\x10\x1B\xA4\x0A\x8C\xDF\x02I)I)U\xD4\x1D\x04sk-\xC5\x18i\xDF\xF7\x87^\xC1\x0E\x83\x8C1\x94R*\xC6!\x84\xF2\xAF\xB5\xEE[\x91s\xAE\x00\xBC\xF7o\x8DO\x83*\x043[3 \x9E#\x90\xAF@\x88\xA8\xC6\xC5\xD6\xDE\xD34\x95\xCE\xC2\xE2\xE3\x9B\x0D\x84\x16F5\xE8*\xB6\x0D[#\xDB\xB6\x8D\xEFd\xE8\x11Y\x13\x08U\x9C\x8D\xEC#\xA8F\x86\xF5a?T[w\xFD\x7F^\x13\xAD\xA0\xCB\xAE\xF2k\x1E'W=\xB7\xEEg$\xB5K\xF7\xF6\xC56\x00\x00\x00\x00IEND\xAEB`\x82";
    ICON_PNG["ease_in_on"] = "\x89PNG\x0D\x0A\x1A\x0A\x00\x00\x00\x0DIHDR\x00\x00\x00\x1A\x00\x00\x00\x18\x08\x06\x00\x00\x00\xE4\x82\xED\xC5\x00\x00\x00\xE0IDATx\xDAc`\x00\x82\xF8\xDE\x1D\x01@|\x1F\x88\xFFS\x19\x83\xCC\x0C`\x80Y\x12\xD1\xB4\xEA\xBFSB\xDD\x7F\xCB\xC0l\xAAb\x90\x99 \xB3\xC1\x96\x81l\xA5\x85%\xC8\x96\x81\xEC\x00YD3K`\x18d\xC7\xD0\xB2((\xBD\xEE\x7FV\xCD\x040\xA6\xBAE \xC3Wl\xDE\xF7\xFF\xD9\xCB7\xFF\x91\x016\xCB\xC8\xB6h\xCE\x8A\xAD\xFF?\x7F\xF9\x066\xF8\xD6\xBD\xC7`~y\xFBL\xEA\xFAh\xEB\xBE\x13`\x0B\xCE]\xB9\x85\xD3`\x8A-\x82Y\x02\xA2i\x96\x18@\xC1C\x8E%$Y\x04\x0A\"Xp\xD1,y\xBB\xC6\x94\x80S\x16(\xF2Al\x9AY\x04J\xC2 \x00JU4\xCB\xB0\xB0 ;x\xF2\"\xEDJ\x06j\x04\x19Q\x16\x81|Ai\x90\x11\xB4\x08\x16d\xA0\xF8\xA1y\xA1Jl\xAE\x1F\x9E\xD5\x04\xB1\x16\xD1\xAD*\xA7O\xE3\x84^\xCD-\x00:\xDA5)b\x04\xF7\x80\x00\x00\x00\x00IEND\xAEB`\x82";
    ICON_PNG["ease_out_off"] = "\x89PNG\x0D\x0A\x1A\x0A\x00\x00\x00\x0DIHDR\x00\x00\x00\x1A\x00\x00\x00\x18\x08\x06\x00\x00\x00\xE4\x82\xED\xC5\x00\x00\x00\xD8IDATx\xDA\xDD\xD6!\x0E\xC3 \x14\x06\xE0\x9E\x06ARG\x13|\x1D\xAAG\xC0\xE1\x908\\e]]/\xB7\xA3\xBC\xF1\x93\x90Ll\x81m<\x92\xAD\xC9K\xAB\xDE\x17~(0M\xE9\xD1Zo\xA9n\xA9\xA8s\xA1\xE76\x15dY\x16\x92R\x92\x10\xA2k\xA1'zg\x0C*\x07\xF2\x88\xC1\x00\xC4\x86\x94\x82\xF1\x9B\xD0\xBA\xAE\xFC\x90s\x8E\xAE\xEBz\x8Au\x83\x8C1\x19\x09!\xF0\x8Dh\x9Eg:\xCF\x93\x8E\xE3\xC8\xDFl\x10F\xF1*\xB2nP\x89\x0C\xF3\xC3\xB6\xEAZ\"\xEB\x02\xC5\x18\xAB\x91}\x0Dy\xEF3b\xAD\xE5\xFBa\x0B\x827\xCB\xCE\x80\x88J\\\xEF U\x08\x8D\xB1\xAA\x10\xCF\xBE\xEF\x19\xC0\xE4\xB7\xC6\xD5\x04\x01A\xE3RXYX\xC2J\xA9\xFE\x9B*0\xD4\xA7\xCD\xFF\xE3\x98\xA8A\xC3\x8E\xF21\x97\x93Q\xD7\xAD;\xCD\xD7\xB5K\xE8\x0C\xA0\x15\x00\x00\x00\x00IEND\xAEB`\x82";
    ICON_PNG["ease_out_on"] = "\x89PNG\x0D\x0A\x1A\x0A\x00\x00\x00\x0DIHDR\x00\x00\x00\x1A\x00\x00\x00\x18\x08\x06\x00\x00\x00\xE4\x82\xED\xC5\x00\x00\x00\xE3IDATx\xDAc`\x00\x82\xF8\xDE\x1D\x01@|\x1F\x88\xFFS\x19\x83\xCC\x0C`\x80Y\x12\xD1\xB4\xEA\xBFSB\xDD\x7F\xCB\xC0l\xAAb\x90\x99 \xB3\xC1\x96\x81l\xA5\x85%\xC8\x96\x81\xEC\x00YD3K`\x18d\xC7\xD0\xB4(\xABf\x02\xED-Z\xB1y\xDF\x7F\x10\xC0f\x19\xD5,*o\x9F\x09\xB6\xE4\xE0\xC9\x8B\xB4\xF3\x91kL\xC9\xFF\xCF_\xBE\xFD\x7F\xF6\xF2\x0D\x98M3\x8B@\xBE\xC0\x15dT\xB3\x08\x16d\xA0\xF8\xA1Y\xAA#&\xC8\xA8b\xD1\xB9+\xB7\x08\x06\x19\xC5\x16m\xDDw\x02l\xC9\x9C\x15[i\x97aa\x96\x80h\x9A\x94\x0C\xA0 \x82\x05\x17)\x96\x10\xB4\x08d0(U\x81\x82\xE7\xD6\xBD\xC7`\x0B@\x91Olp\x11e\x11\xC8\x12d\x00JY\xA0$\x1C\x94^G\xFDB\x15d\x19\x08\x93k\xF8\xF0\xA8&\x08YD\xB7\xAA\x9C>\x8D\x13z5\xB7\x00\xDDX5)\"@ #\x00\x00\x00\x00IEND\xAEB`\x82";
    /*__ICON_DATA_END__*/

    function loadTileImage(key) {
        var data = ICON_PNG[key];
        if (data === undefined) {
            return null;
        }
        try {
            return ScriptUI.newImage(data);
        } catch (inlineError) {
            // Fall through to the temp-file fallback.
        }
        try {
            var file = new File(Folder.temp.fsName + "/animated_arrow_" + key + ".png");
            file.encoding = "BINARY";
            if (file.open("w")) {
                file.write(data);
                file.close();
                return ScriptUI.newImage(file);
            }
        } catch (fileError) {
            // Fall through to the dropdown fallback in addTileGroup.
        }
        return null;
    }

    function buildUI(host) {
        var panel = (host instanceof Panel)
            ? host
            : new Window("palette", SCRIPT_NAME, undefined, { resizeable: true });

        panel.orientation = "column";
        panel.alignChildren = ["fill", "top"];
        panel.spacing = 5;
        panel.margins = 10;

        var numbersRow = panel.add("group");
        numbersRow.orientation = "row";
        numbersRow.alignChildren = ["left", "center"];
        numbersRow.spacing = 4;
        var strokeInput = addInlineNumber(
            numbersRow,
            "Stroke",
            DEFAULT_STROKE_WIDTH,
            "Stroke width in pixels"
        );
        var headInput = addInlineNumber(
            numbersRow,
            "Head",
            DEFAULT_HEAD_SIZE,
            "Arrowhead size in pixels"
        );
        var durationInput = addInlineNumber(
            numbersRow,
            "Dur",
            DEFAULT_DURATION,
            "Animation duration in seconds"
        );

        var shapeRow = panel.add("group");
        shapeRow.orientation = "row";
        shapeRow.alignChildren = ["left", "center"];
        shapeRow.spacing = 4;
        var styleGroup = addTileGroup(shapeRow, [
            { value: "Triangle", icon: "style_triangle", tip: "Triangle head" },
            { value: "Circle", icon: "style_circle", tip: "Circle head" },
            { value: "Chevron", icon: "style_chevron", tip: "Chevron head" },
            { value: "Diamond", icon: "style_diamond", tip: "Diamond head" }
        ], "Triangle");
        addRowGap(shapeRow);
        var headsGroup = addTileGroup(shapeRow, [
            { value: "End", icon: "at_end", tip: "Head at end of path" },
            { value: "Start", icon: "at_start", tip: "Head at start of path" }
        ], "End");

        var easeRow = panel.add("group");
        easeRow.orientation = "row";
        easeRow.alignChildren = ["left", "center"];
        easeRow.spacing = 4;
        var easingGroup = addTileGroup(easeRow, [
            { value: "Linear", icon: "ease_linear", tip: "Linear" },
            { value: "Easy Ease", icon: "ease_easy", tip: "Easy Ease" },
            { value: "Ease In", icon: "ease_in", tip: "Ease In: decelerate into the end" },
            { value: "Ease Out", icon: "ease_out", tip: "Ease Out: accelerate from the start" }
        ], "Easy Ease");
        addRowGap(easeRow);
        var colorButton = easeRow.add("button", undefined, "");
        colorButton.preferredSize = [40, 20];
        colorButton.minimumSize = [40, 20];
        colorButton.maximumSize = [40, 20];
        var refreshButton = easeRow.add("button", undefined, "\u21BB");
        refreshButton.preferredSize = [22, 20];
        refreshButton.minimumSize = [22, 20];
        refreshButton.maximumSize = [22, 20];
        refreshButton.helpTip = "Load settings from selected arrows";

        var hideSourceCheckbox = panel.add("checkbox", undefined, "Hide source layer");
        hideSourceCheckbox.value = true;
        hideSourceCheckbox.helpTip =
            "Hide the source layer after successful creation.\n" +
            "The source layer is preserved either way.";

        function updateColorSwatchTip() {
            colorButton.helpTip = selectedColorIsMixed
                ? "Mixed arrow colors. Click to choose one color for all."
                : "Arrow color: " + rgbToHex(selectedColor) + ". Click to choose.";
        }
        updateColorSwatchTip();

        colorButton.onDraw = function () {
            var graphics = this.graphics;
            graphics.drawOSControl();
            if (selectedColorIsMixed) {
                drawMixedSwatch(graphics, this.size[0], this.size[1]);
            } else {
                graphics.rectPath(4, 4, this.size[0] - 8, this.size[1] - 8);
                graphics.fillPath(
                    graphics.newBrush(graphics.BrushType.SOLID_COLOR, selectedColor)
                );
            }
            graphics.rectPath(4, 4, this.size[0] - 8, this.size[1] - 8);
            graphics.strokePath(
                graphics.newPen(
                    graphics.PenType.SOLID_COLOR,
                    [0.25, 0.25, 0.25],
                    1
                )
            );
        };

        var buttonRow = panel.add("group");
        buttonRow.orientation = "row";
        buttonRow.alignChildren = ["fill", "center"];
        buttonRow.spacing = 6;
        var createButton = buttonRow.add("button", undefined, "Create Arrow");
        createButton.alignment = ["fill", "center"];
        createButton.preferredSize.height = 30;
        createButton.helpTip =
            "Create an animated arrow from the selected paths.\n" +
            "Alt/Option-click to create a finished, static arrow (no keyframes).";
        var reverseButton = buttonRow.add("button", undefined, "Reverse");
        reverseButton.preferredSize = [82, 30];
        reverseButton.minimumSize = [82, 30];
        reverseButton.maximumSize = [82, 30];
        reverseButton.alignment = ["right", "center"];
        reverseButton.helpTip = "Reverse the direction of selected generated arrows.";

        createButton.onDraw = function (drawState) {
            var graphics = this.graphics;
            try {
                var fill = [0.180, 0.427, 0.643];
                if (drawState && drawState.leftButtonPressed) {
                    fill = [0.157, 0.373, 0.565];
                } else if (drawState && drawState.mouseOver) {
                    fill = [0.208, 0.475, 0.706];
                }
                graphics.rectPath(0, 0, this.size[0], this.size[1]);
                graphics.fillPath(
                    graphics.newBrush(graphics.BrushType.SOLID_COLOR, fill)
                );
                graphics.rectPath(0.5, 0.5, this.size[0] - 1, this.size[1] - 1);
                graphics.strokePath(
                    graphics.newPen(
                        graphics.PenType.SOLID_COLOR,
                        [0.114, 0.302, 0.475],
                        1
                    )
                );
                var font = graphics.font;
                try {
                    font = ScriptUI.newFont(font.name, "BOLD", font.size);
                } catch (fontError) {
                    // Keep the default font when bold is unavailable.
                }
                var textSize = graphics.measureString(this.text, font);
                graphics.drawString(
                    this.text,
                    graphics.newPen(graphics.PenType.SOLID_COLOR, [1, 1, 1], 1),
                    Math.round((this.size[0] - textSize.width) / 2),
                    Math.round((this.size[1] - textSize.height) / 2),
                    font
                );
            } catch (paintError) {
                try {
                    graphics.drawOSControl();
                } catch (nativeError) {
                    // A failed paint must still leave a working button.
                }
            }
        };

        colorButton.onClick = function () {
            runPanelAction(function () {
                var picked = $.colorPicker();
                if (picked >= 0) {
                    selectedColor = integerToRgb(picked);
                    selectedColorIsMixed = false;
                    updateColorSwatchTip();
                    colorButton.notify("onDraw");
                    updateSelectedArrows({ color: selectedColor });
                }
            });
        };

        strokeInput.onChange = function () {
            if (isSyncingControls) {
                return;
            }
            var value = parsePositiveNumber(strokeInput.text, "Stroke width", true);
            if (value !== null) {
                updateSelectedArrows({ strokeWidth: value });
            }
        };

        headInput.onChange = function () {
            if (isSyncingControls) {
                return;
            }
            var value = parsePositiveNumber(headInput.text, "Arrowhead size", true);
            if (value !== null) {
                updateSelectedArrows({ headSize: value });
            }
        };

        durationInput.onChange = function () {
            if (isSyncingControls) {
                return;
            }
            var value = parsePositiveNumber(durationInput.text, "Duration", true);
            if (value !== null) {
                updateSelectedArrows({ duration: value });
            }
        };

        easingGroup.onChange = function (value) {
            updateSelectedArrows({ easing: value });
        };

        styleGroup.onChange = function (value) {
            updateSelectedArrows({ style: value });
        };

        headsGroup.onChange = function (value) {
            updateSelectedArrows({ heads: value });
        };

        createButton.onClick = function () {
            // Restore creation settings first if arrows are no longer selected.
            syncControlsFromSelection();
            runPanelAction(createFromControls);
        };

        function createFromControls() {
            // Read the modifier before any alert can change keyboard state.
            var animate = !ScriptUI.environment.keyboardState.altKey;

            var strokeWidth = parsePositiveNumber(strokeInput.text, "Stroke width");
            if (strokeWidth === null) {
                return;
            }

            var headSize = parsePositiveNumber(headInput.text, "Arrowhead size");
            if (headSize === null) {
                return;
            }

            // Static arrows have no keyframes, so duration and easing are unused.
            var duration = DEFAULT_DURATION;
            var easing = "Linear";
            if (animate) {
                duration = parsePositiveNumber(durationInput.text, "Duration");
                if (duration === null) {
                    return;
                }
                easing = easingGroup.getValue();
            }

            var style = styleGroup.getValue();
            var heads = headsGroup.getValue();
            if (
                easing === null ||
                style === null ||
                heads === null ||
                selectedColorIsMixed
            ) {
                alert(
                    "Choose concrete values for all mixed arrow settings before creating.",
                    SCRIPT_NAME
                );
                return;
            }

            createArrows(
                strokeWidth,
                headSize,
                duration,
                selectedColor,
                easing,
                style,
                heads,
                hideSourceCheckbox.value,
                animate
            );
        }

        reverseButton.onClick = function () {
            runPanelAction(reverseSelectedArrows);
        };

        // Controls show the creation settings until generated arrows are
        // selected. While inspecting, they show the selection's shared/mixed
        // values; leaving the selection restores the creation settings.
        var creationSettings = null;

        function captureControls() {
            return {
                strokeText: strokeInput.text,
                headText: headInput.text,
                durationText: durationInput.text,
                easing: easingGroup.getValue(),
                style: styleGroup.getValue(),
                heads: headsGroup.getValue(),
                color: selectedColor,
                colorIsMixed: selectedColorIsMixed
            };
        }

        function applyControls(settings) {
            strokeInput.text = settings.strokeText;
            headInput.text = settings.headText;
            durationInput.text = settings.durationText;
            easingGroup.setValue(settings.easing);
            styleGroup.setValue(settings.style);
            headsGroup.setValue(settings.heads);
            selectedColor = settings.color;
            selectedColorIsMixed = settings.colorIsMixed;
            updateColorSwatchTip();
            colorButton.notify("onDraw");
        }

        function syncControlsFromSelection() {
            if (isSyncingControls || isRunningPanelAction) {
                return;
            }

            isSyncingControls = true;
            try {
                var values = readSelectedArrowSettings();
                if (values === null) {
                    if (creationSettings !== null) {
                        applyControls(creationSettings);
                        creationSettings = null;
                    }
                    return;
                }

                if (creationSettings === null) {
                    creationSettings = captureControls();
                }
                applyControls({
                    strokeText: displayNumber(values.strokeWidth),
                    headText: displayNumber(values.headSize),
                    durationText: displayNumber(values.duration),
                    easing: values.easing,
                    style: values.style,
                    heads: values.heads,
                    color: values.color === null ? selectedColor : values.color,
                    colorIsMixed: values.color === null
                });
            } catch (syncError) {
                // A failed refresh must never raise a dialog from a focus
                // event; that can loop as the panel regains focus.
            } finally {
                isSyncingControls = false;
            }
        }

        panel.onActivate = syncControlsFromSelection;
        panel.addEventListener("focus", syncControlsFromSelection, true);
        refreshButton.onClick = syncControlsFromSelection;

        panel.onResizing = panel.onResize = function () {
            this.layout.resize();
        };

        panel.layout.layout(true);
        return panel;
    }

    // Modal dialogs (alerts, the color picker) return focus to the panel when
    // they close. Suppress focus-driven refreshes until the action finishes so
    // they cannot overwrite controls or re-enter AE mid-operation.
    function runPanelAction(action) {
        if (isRunningPanelAction) {
            return;
        }
        isRunningPanelAction = true;
        try {
            action();
        } finally {
            isRunningPanelAction = false;
        }
    }

    function addInlineNumber(parent, label, defaultValue, tip) {
        var labelControl = parent.add("statictext", undefined, label);
        labelControl.helpTip = tip;

        var input = parent.add("edittext", undefined, String(defaultValue));
        input.characters = 4;
        input.helpTip = tip;

        return input;
    }

    function addRowGap(parent) {
        var gap = parent.add("group");
        gap.minimumSize = [4, 1];
    }

    // Builds a radio group of icon tiles (iconbutton + custom onDraw). Falls
    // back to a plain dropdown if any tile image fails to load, so an image
    // failure never costs a control. The returned object exposes getValue /
    // setValue (null = no selection, the mixed state) and an onChange slot.
    function addTileGroup(parent, items, defaultValue) {
        var api = {
            onChange: null,
            getValue: null,
            setValue: null
        };
        var images = [];
        var allLoaded = true;
        var i;

        for (i = 0; i < items.length; i += 1) {
            var offImage = loadTileImage(items[i].icon + "_off");
            var onImage = loadTileImage(items[i].icon + "_on");
            if (offImage === null || onImage === null) {
                allLoaded = false;
                break;
            }
            images.push({ off: offImage, on: onImage });
        }

        if (!allLoaded) {
            var texts = [];
            for (i = 0; i < items.length; i += 1) {
                texts.push(items[i].value);
            }
            var dropdown = parent.add("dropdownlist", undefined, texts);
            dropdown.preferredSize.width = 96;
            setDropdownValue(dropdown, defaultValue);
            dropdown.onChange = function () {
                if (
                    !isSyncingControls &&
                    dropdown.selection !== null &&
                    api.onChange !== null
                ) {
                    api.onChange(dropdown.selection.text);
                }
            };
            api.getValue = function () {
                return dropdown.selection === null ? null : dropdown.selection.text;
            };
            api.setValue = function (value) {
                setDropdownValue(dropdown, value);
            };
            return api;
        }

        var group = parent.add("group");
        group.orientation = "row";
        group.spacing = 4;
        var buttons = [];

        function repaintTile(button) {
            // Programmatic state changes do not repaint custom-drawn
            // controls; toggling visibility forces it.
            button.visible = false;
            button.visible = true;
        }

        function selectTile(target) {
            var j;
            for (j = 0; j < buttons.length; j += 1) {
                var shouldBeOn = buttons[j] === target;
                if (buttons[j].value !== shouldBeOn) {
                    buttons[j].value = shouldBeOn;
                    repaintTile(buttons[j]);
                }
            }
        }

        for (i = 0; i < items.length; i += 1) {
            var button = group.add(
                "iconbutton",
                undefined,
                images[i].off,
                { style: "toolbutton", toggle: true }
            );
            button.preferredSize = [TILE_WIDTH, TILE_HEIGHT];
            button.maximumSize = [TILE_WIDTH, TILE_HEIGHT];
            button.helpTip = items[i].tip;
            button.itemValue = items[i].value;
            button.iconOff = images[i].off;
            button.iconOn = images[i].on;
            button.value = items[i].value === defaultValue;
            button.onDraw = function () {
                try {
                    this.graphics.drawImage(
                        this.value === true ? this.iconOn : this.iconOff,
                        0,
                        0
                    );
                } catch (drawError) {
                    // Leave the tile blank rather than break the panel.
                }
            };
            button.onClick = function () {
                selectTile(this);
                if (!isSyncingControls && api.onChange !== null) {
                    api.onChange(this.itemValue);
                }
            };
            buttons.push(button);
        }

        api.getValue = function () {
            var j;
            for (j = 0; j < buttons.length; j += 1) {
                if (buttons[j].value === true) {
                    return buttons[j].itemValue;
                }
            }
            return null;
        };
        api.setValue = function (value) {
            var j;
            for (j = 0; j < buttons.length; j += 1) {
                var shouldBeOn = buttons[j].itemValue === value;
                if (buttons[j].value !== shouldBeOn) {
                    buttons[j].value = shouldBeOn;
                    repaintTile(buttons[j]);
                }
            }
        };
        return api;
    }

    function drawMixedSwatch(graphics, width, height) {
        var x = 4;
        var y = 4;
        var innerWidth = width - 8;
        var innerHeight = height - 8;
        var halfWidth = innerWidth / 2;
        var halfHeight = innerHeight / 2;
        var light = graphics.newBrush(
            graphics.BrushType.SOLID_COLOR,
            [0.72, 0.72, 0.72]
        );
        var dark = graphics.newBrush(
            graphics.BrushType.SOLID_COLOR,
            [0.42, 0.42, 0.42]
        );

        fillRectangle(graphics, x, y, halfWidth, halfHeight, light);
        fillRectangle(graphics, x + halfWidth, y, halfWidth, halfHeight, dark);
        fillRectangle(graphics, x, y + halfHeight, halfWidth, halfHeight, dark);
        fillRectangle(
            graphics,
            x + halfWidth,
            y + halfHeight,
            halfWidth,
            halfHeight,
            light
        );
    }

    function fillRectangle(graphics, x, y, width, height, brush) {
        graphics.rectPath(x, y, width, height);
        graphics.fillPath(brush);
    }

    function displayNumber(value) {
        if (value === null) {
            return "--";
        }
        return String(Math.round(value * 1000) / 1000);
    }

    function setDropdownValue(dropdown, value) {
        var i;
        dropdown.selection = null;
        if (value === null) {
            return;
        }

        for (i = 0; i < dropdown.items.length; i += 1) {
            if (dropdown.items[i].text === value) {
                dropdown.selection = i;
                return;
            }
        }
    }

    function parsePositiveNumber(text, label, quiet) {
        var value = parseFloat(text);
        if (isNaN(value) || value <= 0) {
            if (!quiet) {
                alert(label + " must be a number greater than zero.", SCRIPT_NAME);
            }
            return null;
        }
        return value;
    }

    function integerToRgb(value) {
        return [
            ((value >> 16) & 255) / 255,
            ((value >> 8) & 255) / 255,
            (value & 255) / 255
        ];
    }

    function rgbToHex(rgb) {
        function channelToHex(channel) {
            var value = Math.round(channel * 255).toString(16).toUpperCase();
            return value.length === 1 ? "0" + value : value;
        }

        return "#" +
            channelToHex(rgb[0]) +
            channelToHex(rgb[1]) +
            channelToHex(rgb[2]);
    }

    function createArrows(
        strokeWidth,
        headSize,
        duration,
        color,
        easing,
        style,
        heads,
        hideSourceLayers,
        animate
    ) {
        var comp = app.project ? app.project.activeItem : null;
        if (!(comp instanceof CompItem)) {
            alert("Open a composition and select one or more paths.", SCRIPT_NAME);
            return;
        }

        var pathProperties = findSelectedPathProperties(comp);
        if (pathProperties.length === 0) {
            alert(
                "Select one or more Mask Path or Bezier shape Path properties.",
                SCRIPT_NAME
            );
            return;
        }

        app.beginUndoGroup(
            pathProperties.length === 1 ? "Create Animated Arrow" : "Create Animated Arrows"
        );
        var createdLayers = [];
        var sourceLayers = uniqueSourceLayers(pathProperties);
        var i;

        try {
            for (i = 0; i < pathProperties.length; i += 1) {
                var layerCountBefore = comp.numLayers;
                try {
                    createdLayers.push(
                        createArrowFromPath(
                            comp,
                            pathProperties[i],
                            strokeWidth,
                            headSize,
                            duration,
                            color,
                            easing,
                            style,
                            heads,
                            animate
                        )
                    );
                } catch (pathError) {
                    if (comp.numLayers > layerCountBefore) {
                        try {
                            comp.layer(1).remove();
                        } catch (partialCleanupError) {
                            // The partial layer may already have been removed.
                        }
                    }
                    throw pathError;
                }
            }

            for (i = 1; i <= comp.numLayers; i += 1) {
                comp.layer(i).selected = false;
            }
            for (i = 0; i < createdLayers.length; i += 1) {
                createdLayers[i].selected = true;
            }
            if (hideSourceLayers) {
                for (i = 0; i < sourceLayers.length; i += 1) {
                    sourceLayers[i].enabled = false;
                }
            }
        } catch (error) {
            for (i = 0; i < createdLayers.length; i += 1) {
                try {
                    createdLayers[i].remove();
                } catch (cleanupError) {
                    // The layer reference may already be invalid after an AE error.
                }
            }
            alert("The arrows could not be created.\n\n" + error.toString(), SCRIPT_NAME);
        } finally {
            app.endUndoGroup();
        }
    }

    function uniqueSourceLayers(pathProperties) {
        var layers = [];
        var i;
        var j;

        for (i = 0; i < pathProperties.length; i += 1) {
            var layer = pathProperties[i].propertyGroup(pathProperties[i].propertyDepth);
            var alreadyIncluded = false;

            for (j = 0; j < layers.length; j += 1) {
                if (layers[j] === layer) {
                    alreadyIncluded = true;
                    break;
                }
            }

            if (!alreadyIncluded) {
                layers.push(layer);
            }
        }

        return layers;
    }

    function createArrowFromPath(
        comp,
        sourcePath,
        strokeWidth,
        headSize,
        duration,
        color,
        easing,
        style,
        heads,
        animate
    ) {
        var sourceLayer = sourcePath.propertyGroup(sourcePath.propertyDepth);
        var sourceShape = sourcePath.valueAtTime(comp.time, false);

        if (!sourceShape || !sourceShape.vertices || sourceShape.vertices.length < 2) {
            throw new Error("Each selected path needs at least two vertices.");
        }

        var arrowLayer = comp.layers.addShape();
        arrowLayer.name = uniqueLayerName(comp, sourceLayer.name + " - Animated Arrow");
        arrowLayer.label = sourceLayer.label;
        arrowLayer.comment = "Animated Arrow";

        configureLayerSpace(arrowLayer, sourceLayer);

        var rootContents = arrowLayer.property("ADBE Root Vectors Group");
        var targetContents = copyShapeGroupHierarchy(
            sourcePath,
            rootContents,
            comp.time
        );

        var arrowGroup = targetContents.addProperty("ADBE Vector Group");
        arrowGroup.name = "Arrow Geometry";
        var arrowContents = arrowGroup.property("ADBE Vectors Group");

        var pathGroup = arrowContents.addProperty("ADBE Vector Shape - Group");
        pathGroup.name = "Arrow Path";
        var pathIndex = pathGroup.propertyIndex;

        var stroke = arrowContents.addProperty("ADBE Vector Graphic - Stroke");
        stroke.name = "Arrow Stroke";
        var strokeIndex = stroke.propertyIndex;

        var trim = arrowContents.addProperty("ADBE Vector Filter - Trim");
        trim.name = "Draw On";
        var trimIndex = trim.propertyIndex;

        pathGroup = arrowContents.property(pathIndex);
        pathGroup.property("ADBE Vector Shape").setValue(sourceShape);

        stroke = arrowContents.property(strokeIndex);
        stroke.property("ADBE Vector Stroke Color").setValue(color);
        stroke.property("ADBE Vector Stroke Width").setValue(strokeWidth);
        stroke.property("ADBE Vector Stroke Line Cap").setValue(1);
        stroke.property("ADBE Vector Stroke Line Join").setValue(2);

        trim = arrowContents.property(trimIndex);
        var trimEnd = trim.property("ADBE Vector Trim End");
        trim.property("ADBE Vector Trim Start").setValue(0);
        trim.property("ADBE Vector Trim Offset").setValue(0);
        if (animate) {
            trimEnd.setValueAtTime(comp.time, 0);
            trimEnd.setValueAtTime(comp.time + duration, 100);
            applyEasing(trimEnd, easing);
        } else {
            trimEnd.setValue(100);
        }

        var pathReference = makeExpressionReference(arrowGroup);
        if (heads === "End") {
            var endHead = addArrowhead(
                arrowContents,
                "End Arrowhead",
                headSize,
                color,
                style
            );
            applyArrowheadExpressions(endHead, pathReference, false);
        }
        if (heads === "Start") {
            var startHead = addArrowhead(
                arrowContents,
                "Start Arrowhead",
                headSize,
                color,
                style
            );
            applyArrowheadExpressions(startHead, pathReference, true);
        }

        return arrowLayer;
    }

    function findSelectedPathProperties(comp) {
        var selected = comp.selectedProperties;
        var paths = [];
        var i;

        for (i = 0; i < selected.length; i += 1) {
            if (
                selected[i].matchName === "ADBE Vector Shape" ||
                selected[i].matchName === "ADBE Mask Shape"
            ) {
                paths.push(selected[i]);
            }
        }

        return paths;
    }

    function configureLayerSpace(arrowLayer, sourceLayer) {
        arrowLayer.threeDLayer = sourceLayer.threeDLayer;
        arrowLayer.parent = sourceLayer;

        var transform = arrowLayer.property("ADBE Transform Group");
        transform.property("ADBE Anchor Point").setValue(
            sourceLayer.threeDLayer ? [0, 0, 0] : [0, 0]
        );
        transform.property("ADBE Position").setValue(
            sourceLayer.threeDLayer ? [0, 0, 0] : [0, 0]
        );
        transform.property("ADBE Scale").setValue(
            sourceLayer.threeDLayer ? [100, 100, 100] : [100, 100]
        );
        transform.property("ADBE Rotate Z").setValue(0);

        if (sourceLayer.threeDLayer) {
            transform.property("ADBE Orientation").setValue([0, 0, 0]);
            transform.property("ADBE Rotate X").setValue(0);
            transform.property("ADBE Rotate Y").setValue(0);
        }
    }

    function copyShapeGroupHierarchy(sourcePath, rootContents, sampleTime) {
        var sourceGroups = [];
        var current = sourcePath.parentProperty;
        var i;

        while (current !== null) {
            if (current.matchName === "ADBE Vector Group") {
                sourceGroups.push(current);
            }
            current = current.parentProperty;
        }

        sourceGroups.reverse();

        var targetContents = rootContents;
        for (i = 0; i < sourceGroups.length; i += 1) {
            var copiedGroup = targetContents.addProperty("ADBE Vector Group");
            copiedGroup.name = "Source Transform " + (i + 1);
            copyVectorTransform(
                sourceGroups[i].property("ADBE Vector Transform Group"),
                copiedGroup.property("ADBE Vector Transform Group"),
                sampleTime
            );
            targetContents = copiedGroup.property("ADBE Vectors Group");
        }

        return targetContents;
    }

    function copyVectorTransform(sourceTransform, targetTransform, sampleTime) {
        var matchNames = [
            "ADBE Vector Anchor",
            "ADBE Vector Position",
            "ADBE Vector Scale",
            "ADBE Vector Skew",
            "ADBE Vector Skew Axis",
            "ADBE Vector Rotation",
            "ADBE Vector Group Opacity"
        ];
        var i;

        for (i = 0; i < matchNames.length; i += 1) {
            var sourceProperty = sourceTransform.property(matchNames[i]);
            var targetProperty = targetTransform.property(matchNames[i]);
            if (sourceProperty !== null && targetProperty !== null) {
                targetProperty.setValue(sourceProperty.valueAtTime(sampleTime, false));
            }
        }
    }

    function addArrowhead(parentContents, name, size, color, style) {
        var headGroup = parentContents.addProperty("ADBE Vector Group");
        headGroup.name = name;
        var contents = headGroup.property("ADBE Vectors Group");

        var headPathGroup = contents.addProperty("ADBE Vector Shape - Group");
        headPathGroup.name = "Arrowhead Path";
        var pathIndex = headPathGroup.propertyIndex;

        var fill = contents.addProperty("ADBE Vector Graphic - Fill");
        fill.name = "Arrowhead Fill";
        var fillIndex = fill.propertyIndex;

        headPathGroup = contents.property(pathIndex);
        headPathGroup.property("ADBE Vector Shape").setValue(
            makeArrowheadShape(size, style)
        );

        fill = contents.property(fillIndex);
        fill.property("ADBE Vector Fill Color").setValue(color);
        fill.property("ADBE Vector Fill Opacity").setValue(100);
        return headGroup;
    }

    function makeArrowheadShape(size, style) {
        var headShape = new Shape();
        var vertices;

        if (style === "Circle") {
            var radius = size / 2;
            var tangent = radius * 0.5522847498;
            vertices = [
                [0, 0],
                [-radius, radius],
                [-size, 0],
                [-radius, -radius]
            ];
            headShape.inTangents = [
                [0, -tangent],
                [tangent, 0],
                [0, tangent],
                [-tangent, 0]
            ];
            headShape.outTangents = [
                [0, tangent],
                [-tangent, 0],
                [0, -tangent],
                [tangent, 0]
            ];
        } else if (style === "Chevron") {
            vertices = [
                [0, 0],
                [-size, size * 0.55],
                [-size * 0.7, 0],
                [-size, -size * 0.55]
            ];
        } else if (style === "Diamond") {
            vertices = [
                [0, 0],
                [-size * 0.55, size * 0.45],
                [-size * 1.1, 0],
                [-size * 0.55, -size * 0.45]
            ];
        } else {
            vertices = [
                [0, 0],
                [-size, size * 0.55],
                [-size, -size * 0.55]
            ];
        }

        headShape.vertices = vertices;
        if (style !== "Circle") {
            headShape.inTangents = zeroTangents(vertices.length);
            headShape.outTangents = zeroTangents(vertices.length);
        }
        headShape.closed = true;
        return headShape;
    }

    function zeroTangents(length) {
        var tangents = [];
        var i;
        for (i = 0; i < length; i += 1) {
            tangents.push([0, 0]);
        }
        return tangents;
    }

    function makeExpressionReference(arrowGroup) {
        var names = [];
        var current = arrowGroup;

        while (current !== null && current.matchName !== "ADBE Root Vectors Group") {
            if (current.matchName === "ADBE Vector Group") {
                names.push(current.name);
            }
            current = current.parentProperty;
        }

        names.reverse();

        var reference = "thisLayer";
        var i;
        for (i = 0; i < names.length; i += 1) {
            reference += ".content(\"" + escapeExpressionString(names[i]) + "\")";
        }

        return reference;
    }

    function escapeExpressionString(value) {
        return value.replace(/\\/g, "\\\\").replace(/"/g, "\\\"");
    }

    function applyArrowheadExpressions(headGroup, arrowGroupReference, isStart) {
        var headTransform = headGroup.property("ADBE Vector Transform Group");
        var pathReference = arrowGroupReference + ".content(\"Arrow Path\").path";
        var trimReference = arrowGroupReference + ".content(\"Draw On\").end";
        var strokeWidthReference =
            arrowGroupReference + ".content(\"Arrow Stroke\").strokeWidth";
        var progressExpression = isStart
            ? "0"
            : "Math.max(0, Math.min(1, " + trimReference + " / 100))";
        var offsetSign = isStart ? "-" : "+";
        var rotationOffset = isStart ? " + 180" : "";

        // Sample the direction from a short forward window of pointOnPath rather
        // than tangentOnPath(progress). tangentOnPath is unreliable exactly at the
        // path ends (t = 0 / t = 1) and can return a reversed tangent there, which
        // flips the arrowhead 180 degrees. A finite difference over increasing t
        // always points forward along the path, so the head never inverts.
        var directionLines =
            "var progress = " + progressExpression + ";\n" +
            "var step = 0.002;\n" +
            "var tEnd = Math.min(1, progress + step);\n" +
            "var tStart = Math.max(0, tEnd - step);\n" +
            "var direction = arrowPath.pointOnPath(tEnd) - arrowPath.pointOnPath(tStart);\n";

        headTransform.property("ADBE Vector Position").expression =
            "var arrowPath = " + pathReference + ";\n" +
            directionLines +
            "arrowPath.pointOnPath(progress) " + offsetSign + " normalize(direction) * " +
            strokeWidthReference + ";";

        headTransform.property("ADBE Vector Rotation").expression =
            "var arrowPath = " + pathReference + ";\n" +
            directionLines +
            "radiansToDegrees(Math.atan2(direction[1], direction[0]))" +
            rotationOffset + ";";
    }

    function readSelectedArrowSettings() {
        var comp = app.project ? app.project.activeItem : null;
        if (!(comp instanceof CompItem)) {
            return null;
        }

        var layers = comp.selectedLayers;
        var values = [];
        var i;

        for (i = 0; i < layers.length; i += 1) {
            var arrowGroup = findArrowGroup(layers[i]);
            if (arrowGroup !== null) {
                try {
                    values.push(readArrowSettings(arrowGroup));
                } catch (error) {
                    // Ignore incomplete or manually altered generated arrows.
                }
            }
        }

        if (values.length === 0) {
            return null;
        }

        return {
            strokeWidth: commonNumber(values, "strokeWidth"),
            headSize: commonNumber(values, "headSize"),
            duration: commonNumber(values, "duration"),
            easing: commonText(values, "easing"),
            style: commonText(values, "style"),
            heads: commonText(values, "heads"),
            color: commonColor(values, "color")
        };
    }

    function readArrowSettings(arrowGroup) {
        var contents = arrowGroup.property("ADBE Vectors Group");
        var stroke = findDirectChild(contents, "Arrow Stroke", "ADBE Vector Graphic - Stroke");
        var trim = findDirectChild(contents, "Draw On", "ADBE Vector Filter - Trim");
        var endHead = findDirectChild(contents, "End Arrowhead", "ADBE Vector Group");
        var startHead = findDirectChild(contents, "Start Arrowhead", "ADBE Vector Group");
        var oldHead = findDirectChild(contents, "Arrowhead", "ADBE Vector Group");

        if (stroke === null || trim === null) {
            throw new Error("Missing arrow properties.");
        }
        if (endHead === null && oldHead !== null) {
            endHead = oldHead;
        }

        var head = endHead !== null ? endHead : startHead;
        if (head === null) {
            throw new Error("Missing arrowhead.");
        }

        var headInfo = readArrowheadInfo(head);
        var trimEnd = trim.property("ADBE Vector Trim End");
        var duration = trimEnd.numKeys >= 2
            ? trimEnd.keyTime(trimEnd.numKeys) - trimEnd.keyTime(1)
            : 0;
        var heads = null;

        if (endHead !== null && startHead === null) {
            heads = "End";
        } else if (startHead !== null && endHead === null) {
            heads = "Start";
        }

        return {
            strokeWidth: stroke.property("ADBE Vector Stroke Width").value,
            headSize: headInfo.size,
            duration: duration,
            easing: inferEasing(trimEnd),
            style: headInfo.style,
            heads: heads,
            color: stroke.property("ADBE Vector Stroke Color").value
        };
    }

    function commonNumber(values, propertyName) {
        var first = values[0][propertyName];
        var i;
        for (i = 1; i < values.length; i += 1) {
            if (Math.abs(values[i][propertyName] - first) > 0.001) {
                return null;
            }
        }
        return first;
    }

    function commonText(values, propertyName) {
        var first = values[0][propertyName];
        var i;
        for (i = 1; i < values.length; i += 1) {
            if (values[i][propertyName] !== first) {
                return null;
            }
        }
        return first;
    }

    function commonColor(values, propertyName) {
        var first = values[0][propertyName];
        var i;
        var channel;
        for (i = 1; i < values.length; i += 1) {
            for (channel = 0; channel < 3; channel += 1) {
                if (Math.abs(values[i][propertyName][channel] - first[channel]) > 0.001) {
                    return null;
                }
            }
        }
        return first;
    }

    function updateSelectedArrows(settings) {
        var comp = app.project ? app.project.activeItem : null;
        if (!(comp instanceof CompItem)) {
            return;
        }

        var layers = comp.selectedLayers;
        var arrows = [];
        var i;

        for (i = 0; i < layers.length; i += 1) {
            var arrowGroup = findArrowGroup(layers[i]);
            if (arrowGroup !== null) {
                arrows.push({
                    layer: layers[i],
                    group: arrowGroup
                });
            }
        }

        if (arrows.length === 0) {
            return;
        }

        app.beginUndoGroup("Update Animated Arrow");

        try {
            for (i = 0; i < arrows.length; i += 1) {
                updateArrow(
                    arrows[i].layer,
                    arrows[i].group,
                    settings
                );
            }
        } catch (error) {
            alert("The selected arrow could not be updated.\n\n" + error.toString(), SCRIPT_NAME);
        } finally {
            app.endUndoGroup();
        }
    }

    function updateArrow(layer, arrowGroup, settings) {
        var contents = arrowGroup.property("ADBE Vectors Group");
        var stroke = findDirectChild(contents, "Arrow Stroke", "ADBE Vector Graphic - Stroke");
        var trim = findDirectChild(contents, "Draw On", "ADBE Vector Filter - Trim");

        if (stroke === null || trim === null) {
            throw new Error("A selected arrow is missing required native properties.");
        }

        if (settings.color !== undefined) {
            stroke.property("ADBE Vector Stroke Color").setValue(settings.color);
        }
        if (settings.strokeWidth !== undefined) {
            stroke.property("ADBE Vector Stroke Width").setValue(settings.strokeWidth);
        }
        stroke.property("ADBE Vector Stroke Line Cap").setValue(1);

        var oldHead = findDirectChild(contents, "Arrowhead", "ADBE Vector Group");
        var endHead = findDirectChild(contents, "End Arrowhead", "ADBE Vector Group");
        var startHead = findDirectChild(contents, "Start Arrowhead", "ADBE Vector Group");

        if (endHead === null && oldHead !== null) {
            oldHead.name = "End Arrowhead";
            endHead = oldHead;
        }

        if (settings.heads !== undefined) {
            var templateHead = endHead !== null ? endHead : startHead;
            var templateInfo = templateHead !== null
                ? readArrowheadInfo(templateHead)
                : {
                    size: 28,
                    style: "Triangle",
                    color: stroke.property("ADBE Vector Stroke Color").value
                };

            if (settings.heads === "Start" && endHead !== null) {
                endHead.remove();
                endHead = null;
            }
            if (settings.heads === "End" && startHead !== null) {
                startHead.remove();
                startHead = null;
            }

            endHead = findDirectChild(contents, "End Arrowhead", "ADBE Vector Group");
            startHead = findDirectChild(contents, "Start Arrowhead", "ADBE Vector Group");

            if (settings.heads === "End" && endHead === null) {
                endHead = addArrowhead(
                    contents,
                    "End Arrowhead",
                    templateInfo.size,
                    templateInfo.color,
                    templateInfo.style
                );
            }
            if (
                settings.heads === "Start" &&
                startHead === null
            ) {
                startHead = addArrowhead(
                    contents,
                    "Start Arrowhead",
                    templateInfo.size,
                    templateInfo.color,
                    templateInfo.style
                );
            }

            endHead = findDirectChild(contents, "End Arrowhead", "ADBE Vector Group");
            startHead = findDirectChild(contents, "Start Arrowhead", "ADBE Vector Group");
        }

        updateArrowheadAppearance(endHead, settings);
        updateArrowheadAppearance(startHead, settings);

        trim = findDirectChild(contents, "Draw On", "ADBE Vector Filter - Trim");
        if (settings.duration !== undefined) {
            var trimEnd = trim.property("ADBE Vector Trim End");
            var currentEasing = inferEasing(trimEnd);
            var startTime = trimEnd.numKeys > 0 ? trimEnd.keyTime(1) : compTime();

            while (trimEnd.numKeys > 1) {
                trimEnd.removeKey(trimEnd.numKeys);
            }
            if (trimEnd.numKeys === 0) {
                trimEnd.setValueAtTime(startTime, 0);
            }
            trimEnd.setValueAtTime(startTime + settings.duration, 100);
            applyEasing(trimEnd, currentEasing);
        }
        if (settings.easing !== undefined) {
            applyEasing(
                trim.property("ADBE Vector Trim End"),
                settings.easing
            );
        }

        var expressionReference = makeExpressionReference(arrowGroup);
        if (endHead !== null) {
            applyArrowheadExpressions(endHead, expressionReference, false);
        }
        if (startHead !== null) {
            applyArrowheadExpressions(startHead, expressionReference, true);
        }
        layer.comment = "Animated Arrow";
    }

    function updateArrowheadAppearance(headGroup, settings) {
        if (headGroup === null) {
            return;
        }

        var info = readArrowheadInfo(headGroup);
        var headContents = headGroup.property("ADBE Vectors Group");
        var headPathGroup = findDirectChild(
            headContents,
            "Arrowhead Path",
            "ADBE Vector Shape - Group"
        );
        var fill = findDirectChild(
            headContents,
            "Arrowhead Fill",
            "ADBE Vector Graphic - Fill"
        );

        if (headPathGroup === null || fill === null) {
            throw new Error("A selected arrow is missing its arrowhead properties.");
        }

        if (settings.headSize !== undefined || settings.style !== undefined) {
            headPathGroup.property("ADBE Vector Shape").setValue(
                makeArrowheadShape(
                    settings.headSize !== undefined ? settings.headSize : info.size,
                    settings.style !== undefined ? settings.style : info.style
                )
            );
        }
        if (settings.color !== undefined) {
            fill.property("ADBE Vector Fill Color").setValue(settings.color);
        }
    }

    function readArrowheadInfo(headGroup) {
        var headContents = headGroup.property("ADBE Vectors Group");
        var headPathGroup = findDirectChild(
            headContents,
            "Arrowhead Path",
            "ADBE Vector Shape - Group"
        );
        var fill = findDirectChild(
            headContents,
            "Arrowhead Fill",
            "ADBE Vector Graphic - Fill"
        );
        var shape = headPathGroup.property("ADBE Vector Shape").value;
        var style = inferArrowheadStyle(shape);
        var minimumX = 0;
        var i;

        for (i = 0; i < shape.vertices.length; i += 1) {
            minimumX = Math.min(minimumX, shape.vertices[i][0]);
        }

        return {
            size: style === "Diamond" ? Math.abs(minimumX) / 1.1 : Math.abs(minimumX),
            style: style,
            color: fill.property("ADBE Vector Fill Color").value
        };
    }

    function inferArrowheadStyle(shape) {
        if (shape.vertices.length === 3) {
            return "Triangle";
        }
        if (shape.vertices.length === 4) {
            if (
                shape.inTangents.length === 4 &&
                (
                    shape.inTangents[0][0] !== 0 ||
                    shape.inTangents[0][1] !== 0
                )
            ) {
                return "Circle";
            }
            return Math.abs(shape.vertices[1][0]) < Math.abs(shape.vertices[2][0])
                ? "Diamond"
                : "Chevron";
        }
        return "Triangle";
    }

    function applyEasing(property, preset) {
        if (property.numKeys < 2) {
            return;
        }

        var firstKey = 1;
        var lastKey = property.numKeys;
        var linear = KeyframeInterpolationType.LINEAR;
        var bezier = KeyframeInterpolationType.BEZIER;
        var ease = new KeyframeEase(0, 33.333);

        if (preset === "Linear") {
            property.setInterpolationTypeAtKey(firstKey, linear, linear);
            property.setInterpolationTypeAtKey(lastKey, linear, linear);
        } else if (preset === "Ease In") {
            property.setInterpolationTypeAtKey(firstKey, linear, linear);
            property.setInterpolationTypeAtKey(lastKey, bezier, bezier);
            property.setTemporalEaseAtKey(lastKey, [ease], [ease]);
        } else if (preset === "Ease Out") {
            property.setInterpolationTypeAtKey(firstKey, bezier, bezier);
            property.setTemporalEaseAtKey(firstKey, [ease], [ease]);
            property.setInterpolationTypeAtKey(lastKey, linear, linear);
        } else {
            property.setInterpolationTypeAtKey(firstKey, bezier, bezier);
            property.setTemporalEaseAtKey(firstKey, [ease], [ease]);
            property.setInterpolationTypeAtKey(lastKey, bezier, bezier);
            property.setTemporalEaseAtKey(lastKey, [ease], [ease]);
        }
    }

    function inferEasing(property) {
        if (property.numKeys < 2) {
            return "Linear";
        }

        var firstIsBezier =
            property.keyOutInterpolationType(1) === KeyframeInterpolationType.BEZIER;
        var lastIsBezier =
            property.keyInInterpolationType(property.numKeys) ===
            KeyframeInterpolationType.BEZIER;

        if (firstIsBezier && lastIsBezier) {
            return "Easy Ease";
        }
        if (firstIsBezier) {
            return "Ease Out";
        }
        if (lastIsBezier) {
            return "Ease In";
        }
        return "Linear";
    }

    function reverseSelectedArrows() {
        var comp = app.project ? app.project.activeItem : null;
        if (!(comp instanceof CompItem)) {
            alert("Open a composition and select one or more generated arrows.", SCRIPT_NAME);
            return;
        }

        var layers = comp.selectedLayers;
        var arrowGroups = [];
        var i;

        for (i = 0; i < layers.length; i += 1) {
            var arrowGroup = findArrowGroup(layers[i]);
            if (arrowGroup !== null) {
                arrowGroups.push(arrowGroup);
            }
        }

        if (arrowGroups.length === 0) {
            alert("Select one or more generated arrow layers.", SCRIPT_NAME);
            return;
        }

        app.beginUndoGroup("Reverse Animated Arrow Direction");
        try {
            for (i = 0; i < arrowGroups.length; i += 1) {
                reverseArrowPath(arrowGroups[i]);
            }
        } catch (error) {
            alert("The selected arrow could not be reversed.\n\n" + error.toString(), SCRIPT_NAME);
        } finally {
            app.endUndoGroup();
        }
    }

    function reverseArrowPath(arrowGroup) {
        var contents = arrowGroup.property("ADBE Vectors Group");
        var pathGroup = findDirectChild(
            contents,
            "Arrow Path",
            "ADBE Vector Shape - Group"
        );
        if (pathGroup === null) {
            throw new Error("A selected arrow is missing its path.");
        }

        var pathProperty = pathGroup.property("ADBE Vector Shape");
        pathProperty.setValue(reverseShape(pathProperty.value));
    }

    function reverseShape(shape) {
        var reversed = new Shape();
        var indices = [];
        var vertices = [];
        var inTangents = [];
        var outTangents = [];
        var count = shape.vertices.length;
        var i;
        var sourceIndex;

        if (shape.closed) {
            indices.push(0);
            for (i = count - 1; i >= 1; i -= 1) {
                indices.push(i);
            }
        } else {
            for (i = count - 1; i >= 0; i -= 1) {
                indices.push(i);
            }
        }

        for (i = 0; i < indices.length; i += 1) {
            sourceIndex = indices[i];
            vertices.push(shape.vertices[sourceIndex]);
            inTangents.push(shape.outTangents[sourceIndex]);
            outTangents.push(shape.inTangents[sourceIndex]);
        }

        reversed.vertices = vertices;
        reversed.inTangents = inTangents;
        reversed.outTangents = outTangents;
        reversed.closed = shape.closed;
        return reversed;
    }

    function compTime() {
        var comp = app.project ? app.project.activeItem : null;
        return comp instanceof CompItem ? comp.time : 0;
    }

    function findArrowGroup(layer) {
        var rootContents = layer.property("ADBE Root Vectors Group");
        if (rootContents === null) {
            return null;
        }
        return findDescendant(rootContents, "Arrow Geometry", "ADBE Vector Group");
    }

    function findDescendant(group, name, matchName) {
        var i;
        for (i = 1; i <= group.numProperties; i += 1) {
            var child = group.property(i);
            if (child.name === name && child.matchName === matchName) {
                return child;
            }

            if (child.matchName === "ADBE Vector Group") {
                var nested = findDescendant(
                    child.property("ADBE Vectors Group"),
                    name,
                    matchName
                );
                if (nested !== null) {
                    return nested;
                }
            }
        }
        return null;
    }

    function findDirectChild(group, name, matchName) {
        var i;
        for (i = 1; i <= group.numProperties; i += 1) {
            var child = group.property(i);
            if (child.name === name && child.matchName === matchName) {
                return child;
            }
        }
        return null;
    }

    function uniqueLayerName(comp, baseName) {
        var name = baseName;
        var suffix = 2;

        while (comp.layer(name) !== null) {
            name = baseName + " " + suffix;
            suffix += 1;
        }

        return name;
    }

    var panel = buildUI(thisObj);
    if (panel instanceof Window) {
        panel.center();
        panel.show();
    }
}(this));
