package vaultcore_backend.controller;

import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.io.font.constants.StandardFonts;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import vaultcore_backend.model.Account;
import vaultcore_backend.model.LedgerEntry;
import vaultcore_backend.repository.LedgerEntryRepository;
import vaultcore_backend.repository.UserRepository;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequestMapping("/api/statement")
public class StatementController {

    private final LedgerEntryRepository ledgerRepo;
    private final UserRepository userRepository;

    public StatementController(LedgerEntryRepository ledgerRepo,
                               UserRepository userRepository) {
        this.ledgerRepo = ledgerRepo;
        this.userRepository = userRepository;
    }

    @GetMapping("/download")
    public ResponseEntity<byte[]> downloadStatement(Authentication authentication) throws Exception {

        String username = authentication.getName();

        Account account = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"))
                .getAccount();

        if (account == null) {
            throw new RuntimeException("Account not found for user: " + username);
        }

        List<LedgerEntry> entries =
                ledgerRepo.findByAccountIdOrderByCreatedAtDesc(account.getId());

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(baos);
        PdfDocument pdf = new PdfDocument(writer);
        Document doc = new Document(pdf);

        PdfFont boldFont = PdfFontFactory.createFont(StandardFonts.HELVETICA_BOLD);
        PdfFont normalFont = PdfFontFactory.createFont(StandardFonts.HELVETICA);

        // Header
        doc.add(new Paragraph("VaultCore Bank")
                .setFont(boldFont).setFontSize(22)
                .setFontColor(ColorConstants.DARK_GRAY)
                .setTextAlignment(TextAlignment.CENTER));

        doc.add(new Paragraph("Account Statement")
                .setFont(normalFont).setFontSize(13)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(20));

        doc.add(new Paragraph("Account Holder: " + account.getOwnerName())
                .setFont(boldFont).setFontSize(11));

        doc.add(new Paragraph("Account No: " + account.getAccountNo())
                .setFont(normalFont).setFontSize(11));

        doc.add(new Paragraph("Email: " + account.getEmail())
                .setFont(normalFont).setFontSize(11));

        doc.add(new Paragraph("Generated: " +
                java.time.LocalDateTime.now()
                        .format(DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a")))
                .setFont(normalFont).setFontSize(10)
                .setMarginBottom(15));

        // Table
        Table table = new Table(new float[]{2, 3, 2, 2, 3});
        table.setWidth(500);

        String[] headers = {"Date", "Description", "Type", "Amount (Rs)", "Ref"};
        for (String h : headers) {
            table.addHeaderCell(new Cell()
                    .add(new Paragraph(h)
                            .setFont(boldFont).setFontSize(10))
                    .setBackgroundColor(ColorConstants.LIGHT_GRAY));
        }

        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd MMM yyyy");
        for (LedgerEntry e : entries) {
            table.addCell(new Paragraph(
                    e.getCreatedAt().format(fmt))
                    .setFont(normalFont).setFontSize(9));
            table.addCell(new Paragraph(
                    e.getDescription() != null ? e.getDescription() : "-")
                    .setFont(normalFont).setFontSize(9));
            table.addCell(new Paragraph(
                    e.getEntryType().toString())
                    .setFont(normalFont).setFontSize(9));
            table.addCell(new Paragraph(
                    e.getAmount().toString())
                    .setFont(normalFont).setFontSize(9));
            table.addCell(new Paragraph(
                    e.getTxRef() != null ? e.getTxRef() : "-")
                    .setFont(normalFont).setFontSize(9));
        }

        doc.add(table);
        doc.close();

        HttpHeaders httpHeaders = new HttpHeaders();
        httpHeaders.setContentType(MediaType.APPLICATION_PDF);
        httpHeaders.setContentDisposition(
                ContentDisposition.attachment()
                        .filename("vaultcore-statement.pdf").build());

        return new ResponseEntity<>(baos.toByteArray(), httpHeaders, HttpStatus.OK);
    }
}